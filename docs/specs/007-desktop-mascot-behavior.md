# [007] 데스크톱 마스코트 자율 이동, 화면 경계/창 위 인터랙션 (Shimeji 스타일)

* **ID**: `007`
* **상태**: `done`
* **선행 스펙**: `001`, `002`

---

## 1. 목적 및 배경
캘린더 보드와 분리된 **독립 투명 마스코트 창(`mascot`)** 위에서 캐릭터가 바탕화면 전체를 자유롭게 돌아다니고, 화면 경계(상/하/좌/우)나 다른 OS 윈도우 창 위에 올라가 앉거나 매달리며, 사용자 입력(클릭, 드래그, 일정 알림)에 리액션하는 Shimeji 스타일의 데스크톱 펫 경험을 제공합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: Tauri 멀티 윈도우(`main` 캘린더 보드 + `mascot` 투명 마스코트 창) 및 URL 쿼리(`?window=mascot`) 기반 `MascotPage` 라우팅이 구성된다
- [x] `AC-2`: 마스코트 자율 행동 상태 머신(`idle`, `walk`, `fall`, `edge_cling`, `drag`, `react`)과 중력·경계 충돌 물리 훅(`useMascotBehavior`)이 구현된다
- [x] `AC-3`: Tauri 창 위치 제어(`@tauri-apps/api/window` / 모니터 해상도 조회)를 통해 실제 바탕화면 경계에 맞춰 캐릭터 창이 자율 이동 및 벽/바닥 달라붙기를 수행한다
- [x] `AC-4`: OS 활성 창 상단 테두리 감지(`WindowBoundsProvider` Rust trait + IPC) 추상화가 정의되어 다른 창 위에 올라타는 동작의 기반이 마련된다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src-tauri/` (Rust 백엔드)**:
  * `tauri.conf.json`: `mascot` 투명·항상 위(`alwaysOnTop: true`)·클릭 가능 소형 창 추가
  * `capabilities/default.json` (또는 `mascot.json`): 창 위치 이동(`core:window:allow-set-position`), 모니터 정보(`core:window:allow-current-monitor`) 권한 부여
  * `src/desktop/window_bounds.rs`: `WindowBoundsProvider` trait 및 OS별 창 목록/상단 좌표 조회 IPC (`get_visible_windows`)
* **`src/features/mascot-behavior/`**:
  * `model/useMascotBehavior.ts`: 자율 행동 상태 머신 + 물리 루프(`requestAnimationFrame` / tick)
* **`src/pages/mascot/`**:
  * `ui/MascotPage.tsx`: 마스코트 전용 투명 창 뷰 (`CharacterStage` + 말풍선 + 드래그/더블클릭으로 메인 캘린더 창 토글)
* **`src/app/App.tsx`**: `?window=mascot` vs `main` 창 라우팅 분기

## 4. 검증 방법
- [ ] `yarn typecheck && yarn build` 통과
- [ ] `cd src-tauri && cargo check` 통과
- [ ] 브라우저(`/?window=mascot`) 및 `yarn tauri dev`에서 마스코트 자율 이동, 화면 경계 달라붙기, 클릭/드래그 리액션 확인
