# [006] 크로스 플랫폼 창 고정 · 바탕화면 보드 모드 · 반응형 확장

* **ID**: `006`
* **상태**: `done`
* **선행 스펙**: `001`

---

## 1. 목적 및 배경
macOS 네이티브 WidgetKit의 고정 크기 제한(`ExtraLarge`)을 넘어, **화면 전체 또는 원하는 대형 크기**로 캘린더 보드를 띄워둘 수 있도록 **바탕화면 레벨 고정(Desktop Window Level) + 화면 채우기/자유 리사이즈 + 반응형 대형 보드 레이아웃**을 제공합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: 트레이 메뉴와 IPC를 통해 **창 레이어 모드**(일반 / 바탕화면 고정 / 항상 위) 및 **화면 채우기(Full Board)** 토글을 지원한다
- [x] `AC-2`: macOS에서 바탕화면 고정 시 `NSWindow` 레벨(`kCGDesktopWindowLevel`) 및 모든 데스크톱 Space 유지(`canJoinAllSpaces` + `stationary`)가 적용된다
- [x] `AC-3`: 창 크기 조절(`resizable: true`) 및 창 너비에 따라 반응형 2컬럼(좌측 미니 달력 / 우측 일정 보드) 레이아웃으로 자동 확장된다
- [x] `AC-4`: `[SPEC-006:AC-X]` 주석이 명시되고 `cargo check` 및 `yarn typecheck && yarn build`가 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/src/desktop/window_level.rs`**: OS별 창 레벨(바탕화면 고정 / 일반 / 항상 위) 및 화면 작업 영역 채우기 제어
* **`src-tauri/src/lib.rs`**: 트레이 메뉴 확장 및 `set_widget_pin_mode`, `toggle_full_board_size` IPC 커맨드
* **`src-tauri/tauri.conf.json`**: `main` 창 `resizable: true` 허용
* **`src/widgets/calendar-board/` & `src/app/styles/global.css`**: 반응형 대형 보드 레이아웃 (640px 이상일 때 2컬럼 자동 확장)
