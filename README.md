# Cal-Widget

**Mac, Linux, Windows**에서 동작하는 크로스 플랫폼 바탕화면 위젯 프로그램입니다.  
바탕화면 위에서 인터랙티브 캐릭터 애니메이션(Rive / Lottie / 2D 스프라이트)과 함께 **Google Calendar, CalDAV(iCloud, Nextcloud, Synology, Fastmail 등), ICS** 등 다양한 일정 데이터를 하나의 캘린더 보드로 확인할 수 있습니다.

---

## 프로젝트 목적

1. **가벼운 상주형 바탕화면 위젯**: Tauri v2 기반의 투명·프레임리스 창으로 시스템 리소스를 최소화하면서 OS에 구애받지 않는 위젯 환경을 제공합니다.
2. **살아있는 캐릭터 인터랙션**: 일정 유무, 다가오는 일정 알림, 사용자 클릭에 반응하는 캐릭터 애니메이션을 제공합니다.
3. **모든 일정 소스의 통합**: Google Calendar API(OAuth 2.0)와 CalDAV 프로토콜을 어댑터(Provider) 구조로 통합해 일관된 보드에서 일정을 관리합니다.
4. **확장 가능한 프론트엔드 아키텍처**: FSD(Feature-Sliced Design) 기반 계층화와 디자인 패턴(Repository/DI, Strategy, Public API)을 적용해 컴포넌트 재사용성과 유지보수성을 확보합니다.

---

## Requirements

### 공통 개발 도구
* **Node.js**: `v20.0.0` 이상 권장 (현재 확인 환경: `v24.21.0`)
* **Yarn**: `v1.22.x` (`npm` 대신 `yarn` 사용 권장)
* **Rust & Cargo**: 최신 안정 버전 (Tauri v2 백엔드 빌드용, 현재 확인 환경: `1.100.0`)

### OS별 Tauri v2 시스템 의존성
* **macOS**: Xcode Command Line Tools (`xcode-select --install`)
* **Windows**: Microsoft C++ Build Tools, WebView2 (Windows 10/11 기본 포함)
* **Linux (Ubuntu/Debian 기준)**:
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
    libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```

---

## Getting Started

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repository-url>
cd cal-widget
yarn install
```

### 2. 프론트엔드 개발 서버 실행 (브라우저 미리보기)
현재 프로젝트는 `MockCalendarRepository`가 의존성 주입(DI)되어 있어 Tauri 백엔드 없이도 브라우저에서 UI와 컴포넌트를 개발·테스트할 수 있습니다.
```bash
yarn dev
```
실행 후 `http://localhost:1420`에서 위젯 UI를 확인할 수 있습니다.

### 3. 타입 체크 및 프로덕션 빌드
```bash
yarn typecheck
yarn build
```

### 4. Tauri 데스크톱 위젯 실행 (백엔드 연동 후)
```bash
yarn tauri dev
```

---

## 프로젝트 구조 (FSD 기반 계층화)

```text
src/
├── app/          # 앱 진입점, 전역 Provider(DI 조립), 스타일, 뷰 분기
├── pages/        # 창(Window) 단위 페이지 (WidgetPage, SettingsPage)
├── widgets/      # 독립 UI 블록 조합 (CalendarBoardWidget, CharacterPetWidget)
├── features/     # 사용자 액션 및 상태 로직 (useCalendarEvents 등)
├── entities/     # 도메인 모델과 UI 요소 (EventCard, MiniCalendar, CharacterStage 등)
└── shared/       # 도메인 비종속 공용 유틸, API 추상화, UI 부품 (Tooltip, MarkdownText 등)
```

* 각 슬라이스는 루트 `index.ts`를 통해 **Public API**만 외부에 노출합니다.
* 데이터 소스는 [calendar-repository.ts](src/shared/api/calendar-repository.ts)의 `ICalendarRepository` 인터페이스로 추상화되어 있으며, [AppProviders.tsx](src/app/providers/AppProviders.tsx)에서 구현체를 주입합니다.

---

## 개발 명세 및 진행 추적

이 프로젝트는 **JSON(`docs/specs/specs.json`) + Markdown(`docs/specs/*.md`) 하이브리드 구조**로 요구사항과 진행 상태를 관리합니다.

* **스펙 레지스트리 (단일 진실 원천)**: [docs/specs/specs.json](docs/specs/specs.json)
* **전체 로드맵 요약**: [docs/specs/ROADMAP.md](docs/specs/ROADMAP.md)
* **관련 에이전트 스킬**:
  * `spec-authoring`: 요구사항을 체계화해 `specs.json`과 상세 명세서(`.md`)로 문서화
  * `spec-tracking`: `specs.json` 기반으로 진행률, 선행 의존성, 수용 기준(AC) 및 다음 작업 추적
