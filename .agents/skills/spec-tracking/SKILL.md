---
name: spec-tracking
description: >-
  Use this skill when the user asks about project progress, what to build next,
  dependencies between specs, or wants to update implementation status and
  acceptance criteria in docs/specs/specs.json.
---

# Spec Tracking (진행 상태 추적 및 다음 단계 관리)

`docs/specs/specs.json`을 단일 진실 원천으로 삼아 개발 진행률, 수용 기준(AC) 달성 여부, 다음 구현 대상을 추적하는 스킬입니다.

## 주요 기능

1. **진행 현황 브리핑 (Status Report)**
   * `docs/specs/specs.json`을 읽어 상태별(`done`, `in_progress`, `planned`, `blocked`) 개수를 집계합니다.
   * 각 스펙의 `acceptance_criteria` 완료 비율(예: `2/4`)을 계산해 보여줍니다.
2. **다음 작업 추천 (Next Actionable Specs)**
   * `status === "planned"` 이면서 `depends_on`에 포함된 모든 스펙이 `"done"`인 항목을 찾아 우선순위(`high` → `medium` → `low`) 순으로 추천합니다.
   * 추천된 스펙의 `doc_path`가 `null`이면 `spec-authoring` 스킬로 상세 명세를 먼저 작성하도록 안내합니다.
3. **상태 및 수용 기준 갱신 (Update Progress)**
   * 구현이 진행되거나 완료되면 `docs/specs/specs.json`에서 해당 스펙의:
     * `acceptance_criteria[i].done` (`true` / `false`)
     * `status` (`"in_progress"` 또는 모든 AC 완료 시 `"done"`)
     * `updated_at` (오늘 날짜 `YYYY-MM-DD`) 및 최상위 `updated_at`
     을 업데이트합니다.
   * 연결된 마크다운 파일(`doc_path`)이 있다면 해당 파일의 상태와 체크박스도 함께 동기화합니다.
   * `docs/specs/ROADMAP.md`가 존재하면 상태 표를 `specs.json`과 일치시킵니다.

## 검증 기준

* `specs.json` 수정 후 반드시 유효한 JSON 문법인지 확인합니다.
* `status`를 `"done"`으로 변경하기 전에 해당 스펙의 모든 `acceptance_criteria`가 `done: true`이고 실제 검증(빌드/테스트)이 통과했는지 확인합니다.
* 구현 코드에 `[SPEC-NNN:AC-X]` 추적 주석이 누락되지 않았는지 함께 점검합니다.
* 요구사항 구현 및 검증이 완료되면 `AGENTS.md` 규칙에 따라 커밋을 진행하며, subject에 스펙 ID와 완료된 AC(TC) 목록을 포함합니다(예: `feat(SPEC-001): ... [AC-1..AC-4]`).
