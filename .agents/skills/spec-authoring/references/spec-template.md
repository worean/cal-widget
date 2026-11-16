# [NNN] 기능 제목

* **ID**: `NNN`
* **상태**: `planned`
* **선행 스펙**: (예: `000` 또는 없음)

---

## 1. 목적 및 배경
이 기능이 왜 필요한지, 사용자에게 어떤 가치를 제공하는지 간단명료하게 작성합니다.

## 2. 수용 기준 (Acceptance Criteria)
`docs/specs/specs.json`의 `acceptance_criteria`와 1:1로 대응시킵니다.
- [ ] `AC-1`: ...
- [ ] `AC-2`: ...

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/` (Rust 백엔드)**:
* **`src/shared/`**:
* **`src/entities/`**:
* **`src/features/`**:
* **`src/widgets/`**:
* **`src/pages/`**:
* **`src/app/`**:

## 4. 데이터 모델 / IPC 계약 (필요 시)
새로 추가되거나 변경되는 TypeScript 타입, Repository 메서드, Tauri `invoke` 커맨드 시그니처를 기록합니다.

## 5. 검증 방법
- [ ] `yarn typecheck && yarn build` 통과
- [ ] 수동/자동 테스트 시나리오
