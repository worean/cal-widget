use crate::providers::{CalendarProvider, ProviderSyncResult};
use crate::storage::db::{CalendarEventDto, ProviderAccountRecord};
use chrono::{DateTime, Duration, Local, NaiveDate, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::net::TcpListener;
use url::Url;

pub struct GoogleCalendarProvider;

impl CalendarProvider for GoogleCalendarProvider {
    fn provider_name(&self) -> &'static str {
        "google"
    }
}

// [SPEC-004:AC-2] Google OAuth 2.0 자격 증명 및 루프백 인증 플로우
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleCredentials {
    pub client_id: String,
    pub client_secret: String,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at_epoch: i64,
}

#[derive(Debug, Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    expires_in: Option<i64>,
    refresh_token: Option<String>,
}

fn open_browser(url: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    let status = std::process::Command::new("open").arg(url).status();
    #[cfg(target_os = "linux")]
    let status = std::process::Command::new("xdg-open").arg(url).status();
    #[cfg(target_os = "windows")]
    let status = std::process::Command::new("cmd")
        .args(["/C", "start", "", url])
        .status();

    status
        .map_err(|e| format!("브라우저 실행 실패: {e}"))?
        .success()
        .then_some(())
        .ok_or_else(|| "브라우저를 열지 못했습니다.".to_string())
}

pub async fn authorize_google_oauth(
    client_id: String,
    client_secret: String,
) -> Result<GoogleCredentials, String> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("로컬 콜백 서버 바인딩 실패: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| e.to_string())?
        .port();
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");

    let mut auth_url = Url::parse("https://accounts.google.com/o/oauth2/v2/auth")
        .map_err(|e| e.to_string())?;
    auth_url
        .query_pairs_mut()
        .append_pair("client_id", &client_id)
        .append_pair("redirect_uri", &redirect_uri)
        .append_pair("response_type", "code")
        .append_pair("scope", "https://www.googleapis.com/auth/calendar.readonly")
        .append_pair("access_type", "offline")
        .append_pair("prompt", "consent");

    open_browser(auth_url.as_str())?;

    // 별도 블로킹 스레드에서 단일 OAuth 콜백 요청 수신
    let code = tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        let (mut stream, _) = listener
            .accept()
            .map_err(|e| format!("OAuth 콜백 수신 실패: {e}"))?;
        let mut buf = [0u8; 4096];
        let n = stream.read(&mut buf).map_err(|e| e.to_string())?;
        let req = String::from_utf8_lossy(&buf[..n]);
        let path = req
            .lines()
            .next()
            .and_then(|line| line.split_whitespace().nth(1))
            .ok_or_else(|| "잘못된 OAuth 콜백 요청".to_string())?;

        let parsed = Url::parse(&format!("http://127.0.0.1{path}")).map_err(|e| e.to_string())?;
        let code = parsed
            .query_pairs()
            .find(|(k, _)| k == "code")
            .map(|(_, v)| v.into_owned())
            .ok_or_else(|| "인가 코드(code)를 받지 못했습니다.".to_string())?;

        let html = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<html><body><h2>Cal-Widget Google 인증 완료</h2><p>이 창을 닫고 앱으로 돌아가세요.</p></body></html>";
        let _ = stream.write_all(html.as_bytes());
        Ok(code)
    })
    .await
    .map_err(|e| e.to_string())??;

    let client = reqwest::Client::new();
    let res = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code.as_str()),
            ("client_id", client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("redirect_uri", redirect_uri.as_str()),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|e| format!("토큰 요청 실패: {e}"))?;

    if !res.status().is_success() {
        let text = res.text().await.unwrap_or_default();
        return Err(format!("Google 토큰 발급 오류: {text}"));
    }

    let token: GoogleTokenResponse = res.json().await.map_err(|e| e.to_string())?;
    let now_epoch = Utc::now().timestamp();

    Ok(GoogleCredentials {
        client_id,
        client_secret,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at_epoch: now_epoch + token.expires_in.unwrap_or(3600) - 60,
    })
}

async fn refresh_if_needed(
    creds: &GoogleCredentials,
) -> Result<Option<GoogleCredentials>, String> {
    if Utc::now().timestamp() < creds.expires_at_epoch {
        return Ok(None);
    }
    let refresh_token = creds
        .refresh_token
        .as_deref()
        .ok_or_else(|| "Refresh Token이 없어 다시 로그인해야 합니다.".to_string())?;

    let client = reqwest::Client::new();
    let res = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", creds.client_id.as_str()),
            ("client_secret", creds.client_secret.as_str()),
            ("refresh_token", refresh_token),
            ("grant_type", "refresh_token"),
        ])
        .send()
        .await
        .map_err(|e| format!("토큰 갱신 실패: {e}"))?;

    if !res.status().is_success() {
        let text = res.text().await.unwrap_or_default();
        return Err(format!("Google 토큰 갱신 오류: {text}"));
    }

    let token: GoogleTokenResponse = res.json().await.map_err(|e| e.to_string())?;
    let mut updated = creds.clone();
    updated.access_token = token.access_token;
    updated.expires_at_epoch = Utc::now().timestamp() + token.expires_in.unwrap_or(3600) - 60;
    Ok(Some(updated))
}
// [/SPEC-004:AC-2]

// [SPEC-004:AC-3] Google Calendar API v3 일정 조회 및 CalendarEventDto 변환
#[derive(Debug, Deserialize)]
struct GoogleEventsResponse {
    items: Option<Vec<GoogleEventItem>>,
}

#[derive(Debug, Deserialize)]
struct GoogleEventItem {
    id: String,
    summary: Option<String>,
    description: Option<String>,
    location: Option<String>,
    start: Option<GoogleEventDateTime>,
    end: Option<GoogleEventDateTime>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GoogleEventDateTime {
    date_time: Option<String>,
    date: Option<String>,
}

fn parse_google_date(dt: &Option<GoogleEventDateTime>) -> (String, bool) {
    if let Some(d) = dt {
        if let Some(ref iso) = d.date_time {
            return (iso.clone(), false);
        }
        if let Some(ref date_only) = d.date {
            if let Ok(naive) = NaiveDate::parse_from_str(date_only, "%Y-%m-%d") {
                let iso = Local
                    .from_local_datetime(&naive.and_hms_opt(0, 0, 0).expect("valid"))
                    .single()
                    .map(|x| x.to_rfc3339())
                    .unwrap_or_else(|| format!("{date_only}T00:00:00Z"));
                return (iso, true);
            }
        }
    }
    (Local::now().to_rfc3339(), false)
}

pub async fn sync_google_account(
    account: &ProviderAccountRecord,
) -> Result<ProviderSyncResult, String> {
    let mut creds: GoogleCredentials =
        serde_json::from_str(&account.credentials_json).map_err(|e| e.to_string())?;
    let mut updated_json = None;

    if let Some(refreshed) = refresh_if_needed(&creds).await? {
        updated_json = Some(serde_json::to_string(&refreshed).map_err(|e| e.to_string())?);
        creds = refreshed;
    }

    let time_min = (Utc::now() - Duration::days(3)).to_rfc3339();
    let time_max = (Utc::now() + Duration::days(30)).to_rfc3339();

    let mut url = Url::parse("https://www.googleapis.com/calendar/v3/calendars/primary/events")
        .map_err(|e| e.to_string())?;
    url.query_pairs_mut()
        .append_pair("singleEvents", "true")
        .append_pair("orderBy", "startTime")
        .append_pair("timeMin", &time_min)
        .append_pair("timeMax", &time_max)
        .append_pair("maxResults", "100");

    let client = reqwest::Client::new();
    let res = client
        .get(url)
        .bearer_auth(&creds.access_token)
        .send()
        .await
        .map_err(|e| format!("Google 일정 조회 실패: {e}"))?;

    if !res.status().is_success() {
        let text = res.text().await.unwrap_or_default();
        return Err(format!("Google API 오류: {text}"));
    }

    let payload: GoogleEventsResponse = res.json().await.map_err(|e| e.to_string())?;
    let events = payload
        .items
        .unwrap_or_default()
        .into_iter()
        .map(|item| {
            let (start_at, is_all_day) = parse_google_date(&item.start);
            let (end_at, _) = parse_google_date(&item.end);
            let end_normalized = DateTime::parse_from_rfc3339(&end_at)
                .map(|d| d.to_rfc3339())
                .unwrap_or(end_at);

            CalendarEventDto {
                id: format!("{}:{}", account.id, item.id),
                source_id: account.id.clone(),
                provider: "google".to_string(),
                title: item.summary.unwrap_or_else(|| "(제목 없음)".to_string()),
                description: item.description,
                location: item.location,
                start_at,
                end_at: end_normalized,
                is_all_day,
                color: Some("#4285F4".to_string()),
            }
        })
        .collect();

    Ok(ProviderSyncResult {
        events,
        updated_credentials_json: updated_json,
    })
}
// [/SPEC-004:AC-3]
