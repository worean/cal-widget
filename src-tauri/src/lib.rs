use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

// [SPEC-001:AC-3] 시스템 트레이 창 표시/숨김 토글 헬퍼
fn toggle_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
// [/SPEC-001:AC-3]

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // [SPEC-001:AC-3] 시스템 트레이 아이콘 및 메뉴(표시/숨김, 항상 위, 종료) 구성
            let toggle_item =
                MenuItem::with_id(app, "toggle_visibility", "위젯 보이기 / 숨기기", true, None::<&str>)?;
            let always_on_top_item =
                CheckMenuItem::with_id(app, "toggle_top", "항상 위에 고정", true, false, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&toggle_item, &always_on_top_item, &quit_item])?;

            let always_on_top_handle = always_on_top_item.clone();
            let mut tray_builder = TrayIconBuilder::with_id("main-tray")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "toggle_visibility" => toggle_main_window(app),
                    "toggle_top" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let next = !window.is_always_on_top().unwrap_or(false);
                            let _ = window.set_always_on_top(next);
                            let _ = always_on_top_handle.set_checked(next);
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
                        toggle_main_window(tray.app_handle());
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
