import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  EventCard,
  MiniCalendar,
  type CalendarEvent,
} from "@/entities/calendar-event";
import { formatTodayHeader } from "@/shared/lib/date";
import { isTauriRuntime } from "@/shared/lib/platform";
import { GlassPanel, IconButton, Tooltip } from "@/shared/ui";

interface CalendarBoardWidgetProps {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

/**
 * Widget Layer:
 * 독립적인 기능 블록(오늘의 날짜, 미니 캘린더, 동기화 버튼, 일정 리스트)을 조합합니다.
 */
export function CalendarBoardWidget({
  events,
  isLoading,
  error,
  onRefresh,
  onOpenSettings,
}: CalendarBoardWidgetProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  // [SPEC-006:AC-1] [SPEC-006:AC-3] 바탕화면 고정 및 전체 화면 보드 토글 상태
  const [isDesktopPin, setIsDesktopPin] = useState(false);
  const [isFullBoard, setIsFullBoard] = useState(false);

  const handleToggleDesktopPin = () => {
    const next = !isDesktopPin;
    setIsDesktopPin(next);
    if (isTauriRuntime()) {
      void invoke("set_widget_pin_mode", { mode: next ? "desktop" : "normal" });
    }
  };

  const handleToggleFullBoard = () => {
    const next = !isFullBoard;
    setIsFullBoard(next);
    if (next) {
      setShowCalendar(true);
    }
    if (isTauriRuntime()) {
      void invoke("set_full_board_mode", { full: next });
    }
  };
  // [/SPEC-006:AC-1] [/SPEC-006:AC-3]

  return (
    <GlassPanel className="calendar-board">
      <header className="calendar-board__header">
        {/* [SPEC-001:AC-2] 바탕화면 위젯 창 드래그 이동 영역 */}
        <div data-tauri-drag-region style={{ cursor: "grab", flex: 1 }}>
          <span className="calendar-board__eyebrow" data-tauri-drag-region>
            TODAY
          </span>
          <h2 className="calendar-board__title" data-tauri-drag-region>
            {formatTodayHeader()}
          </h2>
        </div>
        {/* [/SPEC-001:AC-2] */}
        <div className="calendar-board__actions">
          {/* [SPEC-006:AC-1] [SPEC-006:AC-3] 바탕화면 고정 및 전체 보드 크기 버튼 */}
          {isTauriRuntime() && (
            <>
              <Tooltip content={isDesktopPin ? "일반 창 모드" : "바탕화면 고정 모드"}>
                <IconButton
                  onClick={handleToggleDesktopPin}
                  aria-pressed={isDesktopPin}
                  title="바탕화면 고정"
                >
                  {isDesktopPin ? "📍" : "📌"}
                </IconButton>
              </Tooltip>
              <Tooltip content={isFullBoard ? "기본 위젯 크기" : "화면 꽉 채우기"}>
                <IconButton
                  onClick={handleToggleFullBoard}
                  aria-pressed={isFullBoard}
                  title="화면 크기 전환"
                >
                  {isFullBoard ? "🗗" : "⛶"}
                </IconButton>
              </Tooltip>
            </>
          )}
          {/* [/SPEC-006:AC-1] [/SPEC-006:AC-3] */}
          <Tooltip content="미니 달력 열기/닫기">
            <IconButton
              onClick={() => setShowCalendar((prev) => !prev)}
              aria-pressed={showCalendar}
              title="달력 보기"
            >
              📅
            </IconButton>
          </Tooltip>
          <Tooltip content="일정 동기화">
            <IconButton
              onClick={onRefresh}
              disabled={isLoading}
              title="일정 동기화"
            >
              {isLoading ? "..." : "↻"}
            </IconButton>
          </Tooltip>
          <Tooltip content="설정">
            <IconButton onClick={onOpenSettings} title="설정">
              ⚙
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* [SPEC-006:AC-3] 창 너비에 따라 반응형 2컬럼 확장되는 보드 본문 */}
      <div className="calendar-board__content">
        {showCalendar && (
          <div className="calendar-board__mini">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        )}

        <div className="calendar-board__events">
          {error && (
            <p className="calendar-board__status calendar-board__status--error">
              {error}
            </p>
          )}

          {!error && events.length === 0 && !isLoading && (
            <p className="calendar-board__status">오늘 예정된 일정이 없습니다.</p>
          )}

          <ul className="event-list">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </div>
      </div>
      {/* [/SPEC-006:AC-3] */}
    </GlassPanel>
  );
}
