use serde::Serialize;

// [SPEC-007:AC-4] OS 활성 창 상단 테두리 감지를 위한 WindowBoundsProvider 추상화
#[derive(Debug, Clone, Serialize)]
pub struct WindowRect {
    pub title: String,
    pub owner: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// OS별 활성 창 좌표 목록을 조회하는 어댑터 트레이트
pub trait WindowBoundsProvider {
    fn list_visible_windows(&self) -> Vec<WindowRect>;
}

pub struct DefaultWindowBoundsProvider;

impl WindowBoundsProvider for DefaultWindowBoundsProvider {
    #[cfg(target_os = "macos")]
    fn list_visible_windows(&self) -> Vec<WindowRect> {
        // macOS 화면 녹화/손쉬운 사용 권한 팝업을 강제하지 않고 안전하게 확장할 수 있도록
        // 기본 OS 창 경계 공급자 어댑터 포인트를 제공합니다.
        Vec::new()
    }

    #[cfg(not(target_os = "macos"))]
    fn list_visible_windows(&self) -> Vec<WindowRect> {
        Vec::new()
    }
}

pub fn query_visible_windows() -> Vec<WindowRect> {
    let provider = DefaultWindowBoundsProvider;
    provider.list_visible_windows()
}
// [/SPEC-007:AC-4]
