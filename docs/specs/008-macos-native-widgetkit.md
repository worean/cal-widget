# [008] macOS 네이티브 WidgetKit 위젯 익스텐션

* **ID**: `008`
* **상태**: `done`
* **선행 스펙**: `003`

---

## 1. 목적 및 배경
"각 플랫폼에서 제공하는 최적의 위젯 경험을 제공한다"는 원칙에 따라, **macOS에서는 네이티브 WidgetKit(`.appex`)**으로 캘린더 보드 위젯을 제공합니다. 이를 통해 데스크톱 Space 전환, Mission Control, 시스템 다크/라이트 모드 및 배경 톤 조절과 완벽히 통합됩니다.
*(실시간 마스코트 애니메이션, 계정 연동, Windows/Linux 캘린더 보드는 Tauri 앱이 계속 담당합니다.)*

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: Tauri Rust 백엔드(`003`)가 macOS App Group 공유 경로(또는 지정된 JSON/SQLite 스냅샷)에 오늘의 일정 데이터를 동기화해 기록한다
- [x] `AC-2`: Swift + WidgetKit 타겟(`CalWidgetExtension.appex`)이 생성되고, 공유 데이터를 읽어 Small/Medium/Large/ExtraLarge 캘린더 보드를 렌더링한다
- [x] `AC-3`: Tauri `.app` 번들 빌드 시 WidgetKit `.appex`가 `Contents/PlugIns/`에 포함되고 `pluginkit`으로 위젯 갤러리에 등록된다
- [x] `AC-4`: 위젯 클릭 시 Deep Link(URL Scheme)를 통해 Tauri 앱의 해당 일정 또는 설정 화면으로 연결된다

## 3. 아키텍처 및 데이터 흐름
```text
[Google Calendar / CalDAV]
        │ (동기화: Rust 백엔드)
        ▼
[SQLite DB + macOS App Group 공유 스냅샷]
   ├──▶ [macOS Native WidgetKit (.appex)]  (macOS 바탕화면 위젯)
   ├──▶ [Tauri 투명 캘린더 보드 창]        (Windows / Linux 바탕화면 위젯)
   └──▶ [Tauri 투명 마스코트 창]           (macOS / Windows / Linux 공통)
```

## 4. 검증 방법
- [ ] Xcode / `xcodebuild`로 `CalWidgetExtension.appex` 빌드 성공
- [ ] macOS 위젯 갤러리("위젯 편집")에서 Cal-Widget 위젯 추가 및 데스크톱 Space 전환 시 고정 동작 확인
