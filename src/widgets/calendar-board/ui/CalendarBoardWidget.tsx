import { useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  EventCard,
  MiniCalendar,
  type CalendarEvent,
} from "@/entities/calendar-event";
import { getThreeDayBuckets, toLocalDateKey } from "@/shared/lib/date";
import { isTauriRuntime } from "@/shared/lib/platform";
import { GlassPanel, IconButton, LiveClock, Tooltip } from "@/shared/ui";

interface CalendarBoardWidgetProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

// [SPEC-009:AC-1] [SPEC-009:AC-2] [SPEC-010:AC-1] 좌측(실시간 시계 + 전체 월 달력) / 우측(선택일 기준 3일 일정) 캘린더 보드
export function CalendarBoardWidget({
  selectedDate,
  onSelectDate,
  events,
  isLoading,
  error,
  onRefresh,
  onOpenSettings,
}: CalendarBoardWidgetProps) {
  const [isDesktopPin, setIsDesktopPin] = useState(false);

  const dayBuckets = useMemo(
    () => getThreeDayBuckets(selectedDate),
    [selectedDate],
  );

  const { eventsByDay, eventDateKeys } = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    const keys = new Set<string>();

    for (const evt of events) {
      const key = toLocalDateKey(evt.startAt);
      keys.add(key);
      const list = grouped.get(key) ?? [];
      list.push(evt);
      grouped.set(key, list);
    }

    return { eventsByDay: grouped, eventDateKeys: keys };
  }, [events]);

  const handleToggleDesktopPin = () => {
    const next = !isDesktopPin;
    setIsDesktopPin(next);
    if (isTauriRuntime()) {
      void invoke("set_widget_pin_mode", { mode: next ? "desktop" : "normal" });
    }
  };

  return (
    <GlassPanel className="calendar-board calendar-board--wide">
      <div className="calendar-board__split">
        {/* [SPEC-009:AC-1] 좌측 패널: 실시간 시계 + 전체 현재 월 달력 */}
        <aside className="calendar-board__left">
          <div data-tauri-drag-region className="calendar-board__drag-bar">
            <LiveClock />
          </div>
          <MiniCalendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            eventDateKeys={eventDateKeys}
          />
        </aside>
        {/* [/SPEC-009:AC-1] */}

        {/* [SPEC-009:AC-2] 우측 패널: 이번 주 (금일 포함 3일간) 일정 보드 */}
        <section className="calendar-board__right">
          <header className="calendar-board__header">
            <div data-tauri-drag-region style={{ cursor: "grab", flex: 1 }}>
              <span className="calendar-board__eyebrow" data-tauri-drag-region>
                3-DAY SCHEDULE
              </span>
              <h2 className="calendar-board__title" data-tauri-drag-region>
                3일 일정 ({dayBuckets[0]?.dateLabel} ~ {dayBuckets[2]?.dateLabel})
              </h2>
            </div>
            <div className="calendar-board__actions">
              {isTauriRuntime() && (
                <Tooltip content={isDesktopPin ? "일반 창 모드" : "바탕화면 고정 모드"}>
                  <IconButton
                    onClick={handleToggleDesktopPin}
                    aria-pressed={isDesktopPin}
                    title="바탕화면 고정"
                  >
                    {isDesktopPin ? "📍" : "📌"}
                  </IconButton>
                </Tooltip>
              )}
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

          {error && (
            <p className="calendar-board__status calendar-board__status--error">
              {error}
            </p>
          )}

          <div className="three-day-board">
            {dayBuckets.map((bucket) => {
              const dayEvents = eventsByDay.get(bucket.key) ?? [];
              return (
                <div key={bucket.key} className="three-day-board__section">
                  <div className="three-day-board__day-header">
                    <span
                      className={`three-day-board__day-badge ${bucket.isToday ? "three-day-board__day-badge--today" : ""}`}
                    >
                      {bucket.title}
                    </span>
                    <span className="three-day-board__day-date">
                      {bucket.dateLabel}
                    </span>
                  </div>

                  {dayEvents.length === 0 ? (
                    <p className="three-day-board__empty">예정된 일정 없음</p>
                  ) : (
                    <ul className="event-list">
                      {dayEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        {/* [/SPEC-009:AC-2] */}
      </div>
    </GlassPanel>
  );
}
// [/SPEC-009:AC-1] [/SPEC-009:AC-2]
