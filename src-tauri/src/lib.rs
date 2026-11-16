mod desktop;
mod providers;
mod storage;

use desktop::window_bounds::{query_visible_windows, WindowRect};
use desktop::window_level::{apply_full_board_size, apply_pin_mode};
use providers::caldav::CalDavCredentials;
use providers::google::authorize_google_oauth;
use providers::sync_provider_account;
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;
use storage::db::{
    delete_provider_account, export_widget_snapshot, init_database, list_events_in_range,
    list_provider_accounts, list_sources, replace_events_for_source, save_provider_account,
    update_provider_credentials, CalendarEventDto, CalendarSourceDto, ProviderAccountDto,
    ProviderAccountRecord,
};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, State,
};

// [SPEC-003:AC-2] SQLite 커넥션 및 스냅샷 경로 공유 상태
struct AppStorageState {
    conn: Mutex<Connection>,
    snapshot_path: PathBuf,
}

#[tauri::command]
fn get_calendar_sources(state: State<'_, AppStorageState>) -> Result<Vec<CalendarSourceDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    list_sources(&conn)
}

#[tauri::command]
fn get_calendar_events(
    state: State<'_, AppStorageState>,
    start_at: String,
    end_at: String,
) -> Result<Vec<CalendarEventDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    list_events_in_range(&conn, &start_at, &end_at)
}

// [SPEC-004:AC-3] [SPEC-005:AC-1] 등록된 모든 외부 캘린더(Google/CalDAV) 동기화 및 스냅샷 갱신
async fn sync_all_accounts(state: &AppStorageState) -> Result<(), String> {
    let accounts = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        list_provider_accounts(&conn)?
    };

    for account in accounts {
        let result = sync_provider_account(&account).await?;
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        if let Some(ref updated_json) = result.updated_credentials_json {
            update_provider_credentials(&conn, &account.id, updated_json)?;
        }
        replace_events_for_source(&conn, &account.id, &result.events)?;
    }

    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    export_widget_snapshot(&conn, &state.snapshot_path)
}

#[tauri::command]
async fn sync_calendars(state: State<'_, AppStorageState>) -> Result<(), String> {
    sync_all_accounts(&state).await
}
// [/SPEC-004:AC-3] [/SPEC-005:AC-1]
// [/SPEC-003:AC-2]

// [SPEC-004:AC-2] [SPEC-004:AC-4] [SPEC-005:AC-3] 외부 캘린더 계정 관리 IPC 커맨드
#[tauri::command]
fn list_provider_accounts_cmd(
    state: State<'_, AppStorageState>,
) -> Result<Vec<ProviderAccountDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let records = list_provider_accounts(&conn)?;
    Ok(records
        .into_iter()
        .map(|r| ProviderAccountDto {
            id: r.id,
            provider: r.provider,
            display_name: r.display_name,
            calendar_url: r.calendar_url,
        })
        .collect())
}

#[tauri::command]
async fn connect_google_account(
    state: State<'_, AppStorageState>,
    display_name: String,
    client_id: String,
    client_secret: String,
) -> Result<ProviderAccountDto, String> {
    let creds = authorize_google_oauth(client_id, client_secret).await?;
    let creds_json = serde_json::to_string(&creds).map_err(|e| e.to_string())?;
    let account_id = format!("google-{}", chrono::Utc::now().timestamp_millis());
    let record = ProviderAccountRecord {
        id: account_id.clone(),
        provider: "google".to_string(),
        display_name: display_name.clone(),
        credentials_json: creds_json,
        calendar_url: None,
    };

    {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        save_provider_account(&conn, &record, "#4285F4")?;
    }

    let _ = sync_all_accounts(&state).await;

    Ok(ProviderAccountDto {
        id: account_id,
        provider: "google".to_string(),
        display_name,
        calendar_url: None,
    })
}

#[tauri::command]
async fn add_caldav_account(
    state: State<'_, AppStorageState>,
    display_name: String,
    calendar_url: String,
    username: String,
    password: String,
) -> Result<ProviderAccountDto, String> {
    let creds = CalDavCredentials { username, password };
    let creds_json = serde_json::to_string(&creds).map_err(|e| e.to_string())?;
    let account_id = format!("caldav-{}", chrono::Utc::now().timestamp_millis());
    let record = ProviderAccountRecord {
        id: account_id.clone(),
        provider: "caldav".to_string(),
        display_name: display_name.clone(),
        credentials_json: creds_json,
        calendar_url: Some(calendar_url.clone()),
    };

    {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        save_provider_account(&conn, &record, "#10B981")?;
    }

    sync_all_accounts(&state).await?;

    Ok(ProviderAccountDto {
        id: account_id,
        provider: "caldav".to_string(),
        display_name,
        calendar_url: Some(calendar_url),
    })
}

#[tauri::command]
fn remove_provider_account(
    state: State<'_, AppStorageState>,
    account_id: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    delete_provider_account(&conn, &account_id)?;
    export_widget_snapshot(&conn, &state.snapshot_path)
}
// [/SPEC-004:AC-2] [/SPEC-004:AC-4] [/SPEC-005:AC-3]

// [SPEC-001:AC-3] 시스템 트레이 창 표시/숨김 토글 헬퍼
fn toggle_window_by_label(app: &tauri::AppHandle, label: &str) {
    if let Some(window) = app.get_webview_window(label) {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
// [/SPEC-001:AC-3]

// [SPEC-007:AC-4] OS 활성 창 경계 조회 및 마스코트→캘린더 보드 토글 IPC 커맨드
#[tauri::command]
fn get_visible_windows() -> Vec<WindowRect> {
    query_visible_windows()
}

#[tauri::command]
fn toggle_calendar_board(app: tauri::AppHandle) {
    toggle_window_by_label(&app, "main");
}
// [/SPEC-007:AC-4]

// [SPEC-006:AC-1] 창 고정 모드(normal/desktop/always_on_top) 및 전체 보드 크기 토글 커맨드
#[tauri::command]
fn set_widget_pin_mode(app: tauri::AppHandle, mode: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        apply_pin_mode(&window, &mode)?;
    }
    Ok(())
}

#[tauri::command]
fn set_full_board_mode(app: tauri::AppHandle, full: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        apply_full_board_size(&window, full)?;
    }
    Ok(())
}
// [/SPEC-006:AC-1]

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_visible_windows,
            toggle_calendar_board,
            get_calendar_sources,
            get_calendar_events,
            sync_calendars,
            list_provider_accounts_cmd,
            connect_google_account,
            add_caldav_account,
            remove_provider_account,
            set_widget_pin_mode,
            set_full_board_mode
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // [SPEC-003:AC-1] [SPEC-003:AC-2] 앱 데이터 디렉토리에 SQLite DB 및 위젯 스냅샷 초기화
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
            let db_path = data_dir.join("cal-widget.db");
            let snapshot_path = data_dir.join("widget-snapshot.json");

            let conn = init_database(&db_path)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
            let _ = export_widget_snapshot(&conn, &snapshot_path);

            app.manage(AppStorageState {
                conn: Mutex::new(conn),
                snapshot_path,
            });
            // [/SPEC-003:AC-1] [/SPEC-003:AC-2]

            // [SPEC-001:AC-3] [SPEC-007:AC-1] 시스템 트레이 아이콘 및 메뉴 구성
            let toggle_item =
                MenuItem::with_id(app, "toggle_visibility", "위젯 보이기 / 숨기기", true, None::<&str>)?;
            let toggle_mascot_item =
                MenuItem::with_id(app, "toggle_mascot", "마스코트 보이기 / 숨기기", true, None::<&str>)?;
            let always_on_top_item =
                CheckMenuItem::with_id(app, "toggle_top", "위젯 항상 위에 고정", true, false, None::<&str>)?;
            let desktop_pin_item =
                CheckMenuItem::with_id(app, "toggle_desktop", "바탕화면 보드 모드 (배경 고정)", true, false, None::<&str>)?;
            let full_board_item =
                CheckMenuItem::with_id(app, "toggle_full_board", "화면 꽉 채우기 / 기본 크기", true, false, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[
                    &toggle_item,
                    &toggle_mascot_item,
                    &always_on_top_item,
                    &desktop_pin_item,
                    &full_board_item,
                    &quit_item,
                ],
            )?;

            let always_on_top_handle = always_on_top_item.clone();
            let desktop_pin_handle = desktop_pin_item.clone();
            let full_board_handle = full_board_item.clone();
            let mut tray_builder = TrayIconBuilder::with_id("main-tray")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "toggle_visibility" => toggle_window_by_label(app, "main"),
                    "toggle_mascot" => toggle_window_by_label(app, "mascot"),
                    "toggle_top" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let next = !window.is_always_on_top().unwrap_or(false);
                            let _ = apply_pin_mode(&window, if next { "always_on_top" } else { "normal" });
                            let _ = always_on_top_handle.set_checked(next);
                            if next {
                                let _ = desktop_pin_handle.set_checked(false);
                            }
                        }
                    }
                    "toggle_desktop" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let next = !desktop_pin_handle.is_checked().unwrap_or(false);
                            let _ = apply_pin_mode(&window, if next { "desktop" } else { "normal" });
                            let _ = desktop_pin_handle.set_checked(next);
                            if next {
                                let _ = always_on_top_handle.set_checked(false);
                            }
                        }
                    }
                    "toggle_full_board" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let next = !full_board_handle.is_checked().unwrap_or(false);
                            let _ = apply_full_board_size(&window, next);
                            let _ = full_board_handle.set_checked(next);
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_window_by_label(tray.app_handle(), "main");
                    }
                });

            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }

            tray_builder.build(app)?;
            // [/SPEC-001:AC-3]

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
