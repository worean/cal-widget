# [004] Google Calendar API (OAuth 2.0) 프로바이더 구현

* **ID**: `004`
* **상태**: `done`
* **선행 스펙**: `003`

---

## 1. 목적 및 배경
사용자가 Google 계정을 연결하면 **OAuth 2.0 (PKCE + 로컬 루프백 리다이렉트)** 흐름으로 인증하고, Google Calendar API v3에서 일정을 가져와 로컬 SQLite(`003`)에 저장 및 위젯에 표시합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: `CalendarProvider` 공통 어댑터 트레이트와 `provider_accounts` SQLite 테이블이 구축된다
- [x] `AC-2`: Google OAuth 2.0 루프백 인증 플로우(브라우저 로그인 → 토큰 교환 → 자동 리프레시)가 Rust 백엔드에 구현된다
- [x] `AC-3`: Google Calendar API v3 일정 조회(`events.list`) 및 `CalendarEventDto` 변환 후 SQLite 동기화가 구현된다
- [x] `AC-4`: 설정 화면(`SettingsPage`)에서 Google 계정 연결/삭제 UI가 제공되고, `[SPEC-004:AC-X]` 주석 및 빌드 검증이 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/src/providers/`**: `mod.rs` (`CalendarProvider` 트레이트), `google.rs` (OAuth 2.0 + Calendar API v3)
* **`src-tauri/src/storage/db.rs`**: `provider_accounts` 테이블 및 `upsert_events_for_source`
* **`src/features/calendar-accounts/`**: 계정 연결/해제 훅 및 폼
* **`src/pages/settings/ui/SettingsPage.tsx`**: Google 계정 추가 UI 통합
