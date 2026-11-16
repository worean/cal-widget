use chrono::{Local, TimeZone};
use rusqlite::{params, Connection};
use serde::Serialize;
use std::fs;
use std::path::Path;

// [SPEC-003:AC-1] [SPEC-003:AC-2] 프론트엔드 및 macOS WidgetKit과 공유할 직렬화 모델
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarSourceDto {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub color: String,
    pub is_enabled: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEventDto {
    pub id: String,
    pub source_id: String,
    pub provider: String,
    pub title: String,
    pub description: Option<String>,
    pub location: Option<String>,
    pub start_at: String,
    pub end_at: String,
    pub is_all_day: bool,
    pub color: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WidgetSnapshot {
    updated_at: String,
    events: Vec<CalendarEventDto>,
}
// [/SPEC-003:AC-1] [/SPEC-003:AC-2]

// [SPEC-003:AC-1] SQLite 초기화, 마이그레이션 및 초기 시드
pub fn init_database(db_path: &Path) -> Result<Connection, String> {
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS calendar_sources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            color TEXT NOT NULL,
            is_enabled INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS calendar_events (
            id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            start_at TEXT NOT NULL,
            end_at TEXT NOT NULL,
            is_all_day INTEGER NOT NULL DEFAULT 0,
            color TEXT,
            FOREIGN KEY (source_id) REFERENCES calendar_sources(id)
        );
        ",
    )
    .map_err(|e| e.to_string())?;

    seed_if_empty(&conn)?;
    Ok(conn)
}

fn today_iso_at(hour: u32, minute: u32) -> String {
    let today = Local::now().date_naive();
    let naive = today.and_hms_opt(hour, minute, 0).expect("valid time");
    Local
        .from_local_datetime(&naive)
        .single()
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_else(|| Local::now().to_rfc3339())
}

fn seed_if_empty(conn: &Connection) -> Result<(), String> {
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM calendar_sources", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if count > 0 {
        return Ok(());
    }

    conn.execute(
        "INSERT INTO calendar_sources (id, name, provider, color, is_enabled) VALUES (?1, ?2, ?3, ?4, ?5)",
        params!["src-local-1", "로컬 캘린더 (SQLite)", "local", "#38BDF8", 1],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO calendar_sources (id, name, provider, color, is_enabled) VALUES (?1, ?2, ?3, ?4, ?5)",
        params!["src-google-1", "Google 캘린더 (연동 대기)", "google", "#4285F4", 1],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO calendar_events (id, source_id, provider, title, description, location, start_at, end_at, is_all_day, color)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            "evt-sqlite-1",
            "src-local-1",
            "local",
            "SQLite 로컬 캐시 연동 확인",
            "### 저장소 연결 완료\n- `rusqlite` 로컬 DB에서 불러온 일정입니다.\n- 곧 **macOS WidgetKit**과도 공유됩니다.",
            "MacBook",
            today_iso_at(10, 30),
            today_iso_at(11, 30),
            0,
            "#38BDF8"
        ],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO calendar_events (id, source_id, provider, title, description, location, start_at, end_at, is_all_day, color)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            "evt-sqlite-2",
            "src-google-1",
            "google",
            "Google / CalDAV 프로바이더 설계",
            "OAuth 2.0 및 CalDAV 동기화 어댑터 구현 예정",
            Option::<String>::None,
            today_iso_at(15, 0),
            today_iso_at(16, 30),
            0,
            "#4285F4"
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
// [/SPEC-003:AC-1]

// [SPEC-003:AC-2] 소스/일정 조회 및 macOS 위젯 스냅샷 파일 내보내기
pub fn list_sources(conn: &Connection) -> Result<Vec<CalendarSourceDto>, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, provider, color, is_enabled FROM calendar_sources")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(CalendarSourceDto {
                id: row.get(0)?,
                name: row.get(1)?,
                provider: row.get(2)?,
                color: row.get(3)?,
                is_enabled: row.get::<_, i64>(4)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

pub fn list_events_in_range(
    conn: &Connection,
    start_at: &str,
    end_at: &str,
) -> Result<Vec<CalendarEventDto>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, source_id, provider, title, description, location, start_at, end_at, is_all_day, color
             FROM calendar_events
             WHERE end_at >= ?1 AND start_at <= ?2
             ORDER BY start_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![start_at, end_at], |row| {
            Ok(CalendarEventDto {
                id: row.get(0)?,
                source_id: row.get(1)?,
                provider: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                location: row.get(5)?,
                start_at: row.get(6)?,
                end_at: row.get(7)?,
                is_all_day: row.get::<_, i64>(8)? != 0,
                color: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

pub fn export_widget_snapshot(conn: &Connection, snapshot_path: &Path) -> Result<(), String> {
    let today = Local::now().date_naive();
    let day_start = Local
        .from_local_datetime(&today.and_hms_opt(0, 0, 0).expect("valid"))
        .single()
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_default();
    let day_end = Local
        .from_local_datetime(&today.and_hms_opt(23, 59, 59).expect("valid"))
        .single()
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_default();

    let events = list_events_in_range(conn, &day_start, &day_end)?;
    let snapshot = WidgetSnapshot {
        updated_at: Local::now().to_rfc3339(),
        events,
    };

    if let Some(parent) = snapshot_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&snapshot).map_err(|e| e.to_string())?;
    fs::write(snapshot_path, json).map_err(|e| e.to_string())
}
// [/SPEC-003:AC-2]
