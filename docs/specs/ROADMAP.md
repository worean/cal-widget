# Cal-Widget 개발 로드맵

프로젝트의 전체 마일스톤과 상세 기능 명세(`docs/specs/*.md`)를 추적합니다.

## 현재 진행 상태

| 순번 | 마일스톤 / 기능 | 상태 | 명세서 |
| :--- | :--- | :--- | :--- |
| 000 | React + TypeScript FSD 아키텍처 & 공용 UI 모듈화 | `Done` | - |
| 001 | Tauri v2 초기화 & 투명 바탕화면 위젯 창 / 트레이 구성 | `Done` | [001-tauri-widget-window.md](001-tauri-widget-window.md) |
| 002 | 캐릭터 애니메이션 엔진 연동 (Rive / Lottie / Sprite 전략 구현) | `Done` | [002-character-animation-engine.md](002-character-animation-engine.md) |
| 003 | 로컬 SQLite 캐시 & `TauriCalendarRepository` IPC 연결 | `Planned` | (작성 예정) |
| 004 | Google Calendar API (OAuth 2.0) 프로바이더 구현 | `Planned` | (작성 예정) |
| 005 | CalDAV (iCloud, Nextcloud 등) 프로바이더 구현 | `Planned` | (작성 예정) |
| 006 | 크로스 플랫폼(macOS/Windows/Linux) 창 고정·클릭 투과·패키징 | `Planned` | (작성 예정) |
| 007 | 데스크톱 마스코트 자율 이동, 화면 경계/창 위 인터랙션 (Shimeji 스타일) | `Done` | [007-desktop-mascot-behavior.md](007-desktop-mascot-behavior.md) |
