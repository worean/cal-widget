# [001] Tauri v2 초기화 & 투명 바탕화면 위젯 창 / 트레이 구성

* **ID**: `001`
* **상태**: `done`
* **선행 스펙**: `000`

---

## 1. 목적 및 배경
기존 React + Vite 프론트엔드를 **Tauri v2** 데스크톱 앱으로 감싸 Mac, Linux, Windows 바탕화면 위에서 투명·프레임리스 위젯으로 상주시킵니다. 시스템 트레이 메뉴를 통해 위젯 표시/숨김, 항상 위(Always-on-top) 전환, 앱 종료를 제어할 수 있도록 합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: `@tauri-apps/cli` 및 `@tauri-apps/api`가 설치되고 `src-tauri` Rust 프로젝트가 구성된다
- [x] `AC-2`: 메인 위젯 창이 투명(`transparent: true`), 프레임리스(`decorations: false`), 드래그 이동 가능 상태로 설정된다
- [x] `AC-3`: 시스템 트레이 아이콘과 메뉴(보이기/숨기기, 항상 위 토글, 종료)가 동작하도록 Rust 코드가 구현된다
- [x] `AC-4`: `cargo check` 및 `yarn typecheck && yarn build`가 오류 없이 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/` (Rust 백엔드)**: `Cargo.toml`, `tauri.conf.json`, `capabilities/default.json`, `src/lib.rs`(트레이 및 창 제어), `src/main.rs`
* **`src/shared/`**: Tauri 환경 감지 유틸 (`isTauriRuntime`) 및 향후 IPC 어댑터 기반 마련
* **`src/widgets/calendar-board/`**: 창 드래그 이동을 위한 `data-tauri-drag-region` 헤더 영역 지정
* **`src/app/styles/global.css`**: Tauri 투명 창에서 배경이 투과되도록 `body` 스타일 분기

## 4. 검증 방법
- [ ] `cd src-tauri && cargo check` 통과
- [ ] `yarn typecheck && yarn build` 통과
- [ ] (로컬 GUI 확인) `yarn tauri dev` 실행 시 투명 위젯 창과 트레이 아이콘 표시 확인
