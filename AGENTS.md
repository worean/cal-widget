# Cal-Widget 프로젝트 개발 규칙

## 1. 요구사항 추적 주석 (Spec Traceability Comments)
요구사항은 계속 추가·수정·삭제될 수 있으므로, 모든 기능 구현 코드에 `docs/specs/specs.json`의 스펙 ID 및 수용 기준(AC) ID를 주석으로 남깁니다. 이를 통해 다른 개발자나 AI 에이전트가 코드와 요구사항의 연결 관계를 즉시 파악하고 수정·삭제 시 역추적할 수 있습니다.

* **블록 범위 표기** (여러 줄 또는 함수/모듈 단위):
  * TypeScript / Rust / CSS:
    ```ts
    // [SPEC-001:AC-3] 시스템 트레이 아이콘 및 메뉴 구성
    ...
    // [/SPEC-001:AC-3]
    ```
    ```css
    /* [SPEC-001:AC-2] Tauri 투명 위젯 창 배경 분기 */
    ...
    /* [/SPEC-001:AC-2] */
    ```
* **단일 라인 / JSX 요소 표기**:
  ```tsx
  {/* [SPEC-001:AC-2] 바탕화면 위젯 드래그 이동 영역 */}
  ```
* **변경·삭제 시 역추적**: 요구사항이 수정되거나 삭제되면 `docs/specs/specs.json`과 상세 명세서(`.md`)를 먼저 갱신한 뒤, 코드 내 `[SPEC-NNN:AC-X]` 주석을 검색해 해당 구현 범위를 함께 수정 또는 제거합니다.

## 2. Git 워크플로우 및 커밋 규칙
* **커밋 형식**: Conventional Commits(`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)를 따릅니다.
* **브랜치명**: `feat/<이름>`, `fix/<이름>` 형식을 사용합니다.
* **요구사항 완료 시 커밋 필수**: 요구사항 구현 및 검증이 완료되면 반드시 **로컬 커밋**을 수행합니다.
* **Subject 규칙**: 커밋 제목(subject)만 보고도 어떤 스펙과 수용 기준(TC/AC)이 완료되었는지 확인할 수 있도록 스펙 ID와 AC 번호를 명시합니다.
  * 예: `feat(SPEC-001): initialize Tauri v2 transparent widget window and tray [AC-1..AC-4]`
  * 일부 AC만 완료된 경우: `feat(SPEC-003): add sqlite schema and IPC bridge [AC-1, AC-2]`
* **Merge / Push 보류 원칙**: `git merge`와 `git push`는 임의로 실행하지 않고, 개발이 완료되거나 사용자가 명시적으로 요청할 때만 수행합니다.

## 3. 아키텍처 및 코드 스타일
* 프론트엔드는 FSD(`shared` → `entities` → `features` → `widgets` → `pages` → `app`) 단방향 의존성과 각 슬라이스의 `index.ts` Public API를 준수합니다.
* Node.js 패키지 관리는 `yarn`을 사용합니다.
