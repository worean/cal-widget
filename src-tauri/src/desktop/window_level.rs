use tauri::{LogicalSize, PhysicalPosition, PhysicalSize, Position, Size, WebviewWindow};

// [SPEC-006:AC-1] [SPEC-006:AC-2] OS 창 레이어 모드(일반/바탕화면/항상 위) 및 화면 채우기 제어
pub fn apply_pin_mode(window: &WebviewWindow, mode: &str) -> Result<(), String> {
    match mode {
        "always_on_top" => {
            set_macos_desktop_level(window, false)?;
            window.set_always_on_top(true).map_err(|e| e.to_string())?;
        }
        "desktop" => {
            window.set_always_on_top(false).map_err(|e| e.to_string())?;
            set_macos_desktop_level(window, true)?;
        }
        _ => {
            window.set_always_on_top(false).map_err(|e| e.to_string())?;
            set_macos_desktop_level(window, false)?;
        }
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn set_macos_desktop_level(window: &WebviewWindow, enable_desktop: bool) -> Result<(), String> {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

    let ns_ptr = window.ns_window().map_err(|e| e.to_string())?;
    if ns_ptr.is_null() {
        return Ok(());
    }

    // SAFETY: Tauri의 WebviewWindow::ns_window()가 반환한 유효한 NSWindow 포인터를 메인 스레드 컨텍스트에서 참조합니다.
    let ns_window: &NSWindow = unsafe { &*(ns_ptr as *const NSWindow) };
    if enable_desktop {
        // 바탕화면 바로 위(kCGDesktopWindowLevel + 1)에 배치해 다른 창들 뒤에 깔리면서도 클릭/드래그 가능
        ns_window.setLevel(-2_147_483_622);
        ns_window.setCollectionBehavior(
            NSWindowCollectionBehavior::CanJoinAllSpaces
                | NSWindowCollectionBehavior::Stationary
                | NSWindowCollectionBehavior::IgnoresCycle,
        );
    } else {
        ns_window.setLevel(0);
        ns_window.setCollectionBehavior(NSWindowCollectionBehavior::Default);
    }
    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn set_macos_desktop_level(_window: &WebviewWindow, _enable_desktop: bool) -> Result<(), String> {
    Ok(())
}

pub fn apply_full_board_size(window: &WebviewWindow, full: bool) -> Result<(), String> {
    if full {
        if let Some(monitor) = window.current_monitor().map_err(|e| e.to_string())? {
            let area = monitor.work_area();
            let margin = 24;
            let width = area.size.width.saturating_sub(margin * 2).max(640);
            let height = area.size.height.saturating_sub(margin * 2).max(480);

            window
                .set_position(Position::Physical(PhysicalPosition::new(
                    area.position.x + margin as i32,
                    area.position.y + margin as i32,
                )))
                .map_err(|e| e.to_string())?;
            window
                .set_size(Size::Physical(PhysicalSize::new(width, height)))
                .map_err(|e| e.to_string())?;
        }
    } else {
        window
            .set_size(Size::Logical(LogicalSize::new(380.0, 540.0)))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
// [/SPEC-006:AC-1] [/SPEC-006:AC-2]
