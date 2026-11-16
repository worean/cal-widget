# [005] CalDAV (iCloud, Nextcloud 등) 프로바이더 구현

* **ID**: `005`
* **상태**: `done`
* **선행 스펙**: `003`

---

## 1. 목적 및 배경
iCloud, Nextcloud, Synology Calendar, Fastmail 등 표준 **CalDAV** 서버의 일정을 가져와 Google Calendar와 동일한 `CalendarEventDto` 모델로 통합합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: CalDAV `REPORT` (`calendar-query`) HTTP 요청 및 Basic Auth 인증 클라이언트가 구현된다
- [x] `AC-2`: iCalendar(`VEVENT`) 파서(`UID`, `SUMMARY`, `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION`)가 구현되어 `CalendarEventDto`로 변환된다
- [x] `AC-3`: 설정 화면(`SettingsPage`)에서 CalDAV 서버 URL·계정·앱 비밀번호 등록 및 동기화/삭제가 동작한다
- [x] `AC-4`: `[SPEC-005:AC-X]` 주석이 명시되고 `cargo check` 및 `yarn typecheck && yarn build`가 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/src/providers/caldav.rs`**: CalDAV `REPORT` 클라이언트 및 iCalendar(`VEVENT`) 파서
* **`src-tauri/src/lib.rs`**: `add_caldav_account`, `remove_calendar_account` IPC 커맨드
* **`src/features/calendar-accounts/`**: CalDAV 계정 추가 폼 컴포넌트
