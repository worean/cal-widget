# Cal-Widget 프로젝트 개발 규칙

## 1. 요구사항 추적 주석 (Spec Traceability Comments)
모든 기능 구현 코드에는 `docs/specs/specs.json`의 스펙 ID 및 수용 기준(AC) ID를 주석으로 남겨, 다른 개발자나 AI 에이전트가 코드와 요구사항의 연결 관계를 즉시 파악할 수 있게 합니다.

* **블록 범위 표기** (여러 줄 또는 함수/모듈 단위):
  * TypeScript / Rust / CSS:
    ```ts
    // [SPEC-001:AC-3] 시스템 트레이 아이콘 및 메뉴 구성 시작
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

## 2. 아키텍처 및 코드 스타일
* 프론트엔드는 FSD(`shared` → `entities` → `features` → `widgets` → `pages` → `app`) 단방향 의존성과 각 슬라이스의 `index.ts` Public API를 준수합니다.
* Node.js 패키지 관리는 `yarn`을 사용합니다.
* Git 커밋은 Conventional Commits(`feat:`, `fix:`, `chore:`, `docs:`)를 따릅니다.
* 요구사항 구현이 완료되면 반드시 커밋하며, 커밋 제목(subject)에 스펙 ID와 완료된 수용 기준(TC/AC)을 명시합니다.
  * 예: `feat(SPEC-001): 투명 위젯 창 및 시스템 트레이 구성 [AC-1..AC-4]`
