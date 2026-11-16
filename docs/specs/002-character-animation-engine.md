# [002] 캐릭터 애니메이션 엔진 연동 (Rive / Lottie / Sprite 전략 구현)

* **ID**: `002`
* **상태**: `done`
* **선행 스펙**: `000`

---

## 1. 목적 및 배경
바탕화면 위젯 위에서 캐릭터가 단순 정적 이미지가 아닌 **Lottie, Rive, 2D 스프라이트 시트, 내장 애니메이션** 등 다양한 포맷으로 동작할 수 있도록 Strategy 패턴 기반의 렌더러 엔진을 구축합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: `lottie-web` 및 `@rive-app/canvas`가 설치되고 `CharacterConfig`에 포맷별 옵션이 정의된다
- [x] `AC-2`: `Placeholder`, `Lottie`, `Rive`, `Sprite` 렌더러 컴포넌트가 분리 구현되고 `CharacterStage` 전략 맵에 연결된다
- [x] `AC-3`: 내장 샘플 Lottie/Sprite/Placeholder 프리셋 전환 및 `CharacterMood` 상태 반응(속도/모션/표정)이 동작한다
- [x] `AC-4`: 구현 코드에 `[SPEC-002:AC-X]` 주석이 명시되고 `yarn typecheck && yarn build`가 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src/entities/character/model/types.ts`**: `CharacterConfig`, `SpriteSheetOptions`, `RiveOptions`, `LottieOptions` 타입 확장
* **`src/entities/character/ui/renderers/`**:
  * `PlaceholderRenderer.tsx`
  * `LottieRenderer.tsx` (`lottie-web` 래퍼, 에러 시 fallback 처리)
  * `RiveRenderer.tsx` (`@rive-app/canvas` 래퍼, stateMachine 지원)
  * `SpriteRenderer.tsx` (CSS/타이머 기반 스프라이트 프레임 재생)
* **`src/entities/character/ui/CharacterStage.tsx`**: Strategy 매핑 테이블 연결
* **`src/widgets/character-pet/ui/CharacterPetWidget.tsx`**: 프리셋 전환 및 상태 반응 연동

## 4. 검증 방법
- [ ] `yarn typecheck && yarn build` 통과
- [ ] 브라우저(`yarn dev`) 또는 Tauri(`yarn tauri dev`)에서 프리셋 전환 및 클릭 인터랙션 확인
