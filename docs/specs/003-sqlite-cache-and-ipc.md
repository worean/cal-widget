# [003] 로컬 SQLite 캐시 & TauriCalendarRepository IPC 연결

* **ID**: `003`
* **상태**: `done`
* **선행 스펙**: `001`

---

## 1. 목적 및 배경
Google Calendar, CalDAV, 로컬 일정을 오프라인에서도 빠르게 조회하고, **macOS 네이티브 WidgetKit(`008`)**과 Tauri 프론트엔드가 동일한 일정 데이터를 참조할 수 있도록 **SQLite 로컬 캐시 및 공유 스냅샷 계층**을 구축합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: `rusqlite`(bundled) 기반 SQLite 스키마(`calendar_sources`, `calendar_events`) 및 초기 시드 마이그레이션이 구현된다
- [x] `AC-2`: Tauri IPC 커맨드(`get_calendar_sources`, `get_calendar_events`, `sync_calendars`) 및 macOS 위젯용 JSON 스냅샷(`widget-snapshot.json`) 내보내기가 구현된다
- [x] `AC-3`: `TauriCalendarRepository`가 구현되고 `AppProviders`에서 런타임에 따라 자동 주입된다
- [x] `AC-4`: 코드에 `[SPEC-003:AC-X]` 주석이 명시되고 `cargo check` 및 `yarn typecheck && yarn build`가 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/src/storage/`**: `db.rs` (SQLite 커넥션, 마이그레이션, 쿼리, `widget-snapshot.json` 동기화)
* **`src-tauri/src/lib.rs`**: Tauri State(`AppDbState`) 관리 및 IPC 커맨드 등록
* **`src/shared/api/tauri-calendar-repository.ts`**: `ICalendarRepository`의 Tauri IPC 구현체
* **`src/app/providers/AppProviders.tsx`**: `isTauriRuntime()` 기반 DI 분기

## 4. 검증 방법
- [ ] `cd src-tauri && cargo check` 통과
- [ ] `yarn typecheck && yarn build` 통과
