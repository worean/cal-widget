# [009] 월간 달력 + 실시간 시계 + 금일 포함 3일 일정 보드 UI

* **ID**: `009`
* **상태**: `done`
* **선행 스펙**: `000`, `006`

---

## 1. 목적 및 배경
기존의 "오늘 일정만 보여주는 좁은 위젯"을 대체하여, 좌측에는 **실시간 시계 + 전체 현재 월 달력**, 우측에는 **이번 주(금일 포함 3일간: 오늘·내일·모레) 일정 보드**를 배치한 와이드 캘린더 보드 UI를 구축합니다.

## 2. 수용 기준 (Acceptance Criteria)
- [x] `AC-1`: 좌측 패널 상단에 실시간 현재 시간(`LiveClock`) 컴포넌트가, 하단에 전체 현재 월 달력(일정 유무 도트 표시 포함)이 렌더링된다
- [x] `AC-2`: 우측 패널에 금일 포함 3일(오늘·내일·모레)의 일정이 날짜별 그룹으로 구분되어 표시된다
- [x] `AC-3`: 실제 Calendar API 테스트용 `.env.example` 템플릿이 제공된다
- [x] `AC-4`: `[SPEC-009:AC-X]` 주석이 명시되고 `yarn typecheck && yarn build`가 통과한다

## 3. 아키텍처 및 FSD 계층별 영향 범위
* **`src/shared/ui/LiveClock.tsx`**: 실시간 시계 공용 컴포넌트
* **`src/shared/lib/date.ts`**: `getThreeDayRange()`, `getThreeDayBuckets()` 날짜 헬퍼
* **`src/features/calendar-sync/model/useCalendarEvents.ts`**: 오늘 포함 3일 범위 조회
* **`src/entities/calendar-event/ui/MiniCalendar.tsx`**: 일정 있는 날 도트(`eventDates`) 표시
* **`src/widgets/calendar-board/ui/CalendarBoardWidget.tsx`**: 좌측(시계+월달력) / 우측(3일 일정) 2컬럼 보드
* **`.env.example`**: Google OAuth / CalDAV 테스트용 환경변수 안내
