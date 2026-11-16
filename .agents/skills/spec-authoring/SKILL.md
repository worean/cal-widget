---
name: spec-authoring
description: >-
  Use this skill when the user proposes a new feature, shares rough requirements,
  or wants to structure and document a specification into docs/specs/specs.json
  and docs/specs/<nnn>-<slug>.md for the cal-widget project.
---

# Spec Authoring (요구사항 체계화 및 문서화)

사용자가 전달한 아이디어나 요구사항을 구체화하여 **구조화된 JSON 데이터(`docs/specs/specs.json`)**와 **상세 설계 문서(`docs/specs/<nnn>-<slug>.md`)**로 체계화하는 스킬입니다.

## 관리 구조 (JSON + Markdown 하이브리드)

* **`docs/specs/specs.json`** (단일 진실 원천): 스펙 ID, 상태, 우선순위, 선행 의존성(`depends_on`), 수용 기준(`acceptance_criteria`), 문서 경로(`doc_path`) 관리
* **`docs/specs/<nnn>-<slug>.md`** (상세 설계서): 배경, FSD 계층별 영향 범위, 데이터 모델/IPC 계약, 검증 시나리오 서술
* 스키마 참고: [specs-schema.md](./references/specs-schema.md)
* 마크다운 템플릿: [spec-template.md](./references/spec-template.md)

## 실행 절차

1. **요구사항 명확화**
   * 사용자의 요청에서 불분명한 범위(대상 OS, UI 위치, 데이터 소스 등)가 있으면 짧고 핵심적인 질문으로 먼저 확인합니다.
   * 선행 조건이 필요한 경우 `docs/specs/specs.json`에서 기존 스펙 ID를 확인해 `depends_on`을 지정합니다.
2. **스펙 ID 및 슬러그 부여**
   * `docs/specs/specs.json`의 마지막 `id` 다음 번호(`001`, `002`, ...)를 부여하고, 케밥 케이스 슬러그(예: `001-tauri-widget-window`)를 정합니다.
3. **상세 명세서(`docs/specs/<id>-<slug>.md`) 작성**
   * [spec-template.md](./references/spec-template.md) 형식으로 작성합니다.
   * 프론트엔드 변경이 포함되면 **FSD 계층 규칙**(하위 계층만 참조, `index.ts` Public API 준수)을 반드시 명시합니다.
4. **레지스트리(`docs/specs/specs.json`) 등록**
   * `specs` 배열에 새 항목을 추가합니다.
   * 각 `acceptance_criteria` 항목은 검증 가능한 단위로 쪼개 `AC-1`, `AC-2` 형태로 ID를 부여하고 `done: false`로 초기화합니다.
5. **요약 보고**
   * 생성된 `.md` 파일 경로, `specs.json`에 등록된 ID 및 수용 기준 목록을 사용자에게 알립니다.
