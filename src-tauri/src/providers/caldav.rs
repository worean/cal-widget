use crate::providers::{CalendarProvider, ProviderSyncResult};
use crate::storage::db::{CalendarEventDto, ProviderAccountRecord};
use chrono::{Duration, Local, NaiveDate, NaiveDateTime, TimeZone, Utc};
use reqwest::Method;
use serde::{Deserialize, Serialize};

pub struct CalDavProvider;

impl CalendarProvider for CalDavProvider {
    fn provider_name(&self) -> &'static str {
        "caldav"
    }
}

// [SPEC-005:AC-1] CalDAV 자격 증명 및 REPORT(calendar-query) 요청
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalDavCredentials {
    pub username: String,
    pub password: String,
}

pub async fn sync_caldav_account(
    account: &ProviderAccountRecord,
) -> Result<ProviderSyncResult, String> {
    let calendar_url = account
        .calendar_url
        .as_deref()
        .ok_or_else(|| "CalDAV 캘린더 URL이 없습니다.".to_string())?;
    let creds: CalDavCredentials =
        serde_json::from_str(&account.credentials_json).map_err(|e| e.to_string())?;

    let start_utc = (Utc::now() - Duration::days(3)).format("%Y%m%dT000000Z");
    let end_utc = (Utc::now() + Duration::days(30)).format("%Y%m%dT235959Z");

    let body = format!(
        r#"<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="{start_utc}" end="{end_utc}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>"#
    );

    let report_method =
        Method::from_bytes(b"REPORT").map_err(|e| format!("HTTP REPORT 생성 실패: {e}"))?;
    let client = reqwest::Client::new();
    let res = client
        .request(report_method, calendar_url)
        .basic_auth(&creds.username, Some(&creds.password))
        .header("Depth", "1")
        .header("Content-Type", "application/xml; charset=utf-8")
        .body(body)
        .send()
        .await
        .map_err(|e| format!("CalDAV 요청 실패: {e}"))?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("CalDAV 서버 응답 오류 ({status}): {text}"));
    }

    let xml = res.text().await.map_err(|e| e.to_string())?;
    let events = parse_caldav_multistatus(&xml, &account.id);

    Ok(ProviderSyncResult {
        events,
        updated_credentials_json: None,
    })
}
// [/SPEC-005:AC-1]

// [SPEC-005:AC-2] iCalendar(VEVENT) 파서 및 CalendarEventDto 변환
fn extract_calendar_data_blocks(xml: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut rest = xml;

    while let Some(start_tag_idx) = rest.find("calendar-data") {
        let after_tag = &rest[start_tag_idx..];
        let Some(gt_idx) = after_tag.find('>') else {
            break;
        };
        let content_start = &after_tag[gt_idx + 1..];
        let end_idx = content_start
            .find("</")
            .unwrap_or(content_start.len());
        let raw_ics = content_start[..end_idx]
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&");
        if raw_ics.contains("BEGIN:VEVENT") {
            blocks.push(raw_ics);
        }
        rest = &content_start[end_idx..];
    }

    blocks
}

fn unfold_ics_lines(ics: &str) -> Vec<String> {
    let mut lines: Vec<String> = Vec::new();
    for raw in ics.replace("\r\n", "\n").lines() {
        if (raw.starts_with(' ') || raw.starts_with('\t')) && !lines.is_empty() {
            if let Some(last) = lines.last_mut() {
                last.push_str(raw.trim_start());
            }
        } else {
            lines.push(raw.to_string());
        }
    }
    lines
}

fn parse_ics_datetime(raw: &str) -> (String, bool) {
    let clean = raw.trim();
    if clean.len() == 8 {
        if let Ok(date) = NaiveDate::parse_from_str(clean, "%Y%m%d") {
            let iso = Local
                .from_local_datetime(&date.and_hms_opt(0, 0, 0).expect("valid"))
                .single()
                .map(|dt| dt.to_rfc3339())
                .unwrap_or_else(|| Local::now().to_rfc3339());
            return (iso, true);
        }
    }
    if clean.ends_with('Z') {
        if let Ok(ndt) = NaiveDateTime::parse_from_str(clean, "%Y%m%dT%H%M%SZ") {
            return (Utc.from_utc_datetime(&ndt).to_rfc3339(), false);
        }
    }
    if let Ok(ndt) = NaiveDateTime::parse_from_str(clean, "%Y%m%dT%H%M%S") {
        let iso = Local
            .from_local_datetime(&ndt)
            .single()
            .map(|dt| dt.to_rfc3339())
            .unwrap_or_else(|| Local::now().to_rfc3339());
        return (iso, false);
    }
    (Local::now().to_rfc3339(), false)
}

pub fn parse_caldav_multistatus(xml: &str, source_id: &str) -> Vec<CalendarEventDto> {
    let mut events = Vec::new();

    for ics in extract_calendar_data_blocks(xml) {
        let mut in_event = false;
        let mut uid = String::new();
        let mut summary = String::new();
        let mut description: Option<String> = None;
        let mut location: Option<String> = None;
        let mut dtstart = String::new();
        let mut dtend = String::new();

        for line in unfold_ics_lines(&ics) {
            if line == "BEGIN:VEVENT" {
                in_event = true;
                uid.clear();
                summary.clear();
                description = None;
                location = None;
                dtstart.clear();
                dtend.clear();
                continue;
            }
            if line == "END:VEVENT" && in_event {
                in_event = false;
                let (start_at, is_all_day) = parse_ics_datetime(&dtstart);
                let (end_at, _) = if dtend.is_empty() {
                    (start_at.clone(), is_all_day)
                } else {
                    parse_ics_datetime(&dtend)
                };
                let event_id = if uid.is_empty() {
                    format!("{source_id}:{}", events.len())
                } else {
                    format!("{source_id}:{uid}")
                };

                events.push(CalendarEventDto {
                    id: event_id,
                    source_id: source_id.to_string(),
                    provider: "caldav".to_string(),
                    title: if summary.is_empty() {
                        "(제목 없음)".to_string()
                    } else {
                        summary.clone()
                    },
                    description: description.clone(),
                    location: location.clone(),
                    start_at,
                    end_at,
                    is_all_day,
                    color: Some("#10B981".to_string()),
                });
                continue;
            }

            if !in_event {
                continue;
            }

            if let Some((key_part, val)) = line.split_once(':') {
                let prop = key_part.split(';').next().unwrap_or("");
                let unescaped = val.replace("\\n", "\n").replace("\\,", ",");
                match prop {
                    "UID" => uid = unescaped,
                    "SUMMARY" => summary = unescaped,
                    "DESCRIPTION" => description = Some(unescaped),
                    "LOCATION" => location = Some(unescaped),
                    "DTSTART" => dtstart = unescaped,
                    "DTEND" => dtend = unescaped,
                    _ => {}
                }
            }
        }
    }

    events
}

#[cfg(test)]
mod tests {
    use super::parse_caldav_multistatus;

    #[test]
    fn parses_vevent_from_caldav_xml() {
        let xml = r#"<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
          <D:response>
            <D:propstat><D:prop>
              <C:calendar-data>BEGIN:VCALENDAR
BEGIN:VEVENT
UID:evt-123
SUMMARY:CalDAV 테스트 미팅
LOCATION:회의실 A
DESCRIPTION:테스트 설명
DTSTART:20261116T100000Z
DTEND:20261116T110000Z
END:VEVENT
END:VCALENDAR</C:calendar-data>
            </D:prop></D:propstat>
          </D:response>
        </D:multistatus>"#;

        let events = parse_caldav_multistatus(xml, "caldav-1");
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].id, "caldav-1:evt-123");
        assert_eq!(events[0].title, "CalDAV 테스트 미팅");
        assert_eq!(events[0].location.as_deref(), Some("회의실 A"));
        assert!(!events[0].is_all_day);
    }
}
// [/SPEC-005:AC-2]
