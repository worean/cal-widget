import { useMemo } from "react";
import { toLocalDateKey } from "@/shared/lib/date";
import { IconButton } from "@/shared/ui";

// [SPEC-009:AC-1] [SPEC-010:AC-1] 전체 월 달력 (월 이동, 오늘 복귀, 일정 도트 표시)
interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate?: (date: Date) => void;
  eventDateKeys?: Set<string>;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 재활용 가능한 월간 달력 컴포넌트
 */
export function MiniCalendar({
  selectedDate,
  onSelectDate,
  eventDateKeys,
}: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = Array.from(
      { length: firstDayOfMonth },
      () => null,
    );

    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [year, month]);

  const moveMonth = (delta: number) => {
    onSelectDate?.(new Date(year, month + delta, 1));
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar__header-row">
        <span className="mini-calendar__header">
          {year}년 {month + 1}월
        </span>
        <div className="mini-calendar__nav">
          <IconButton onClick={() => moveMonth(-1)} title="이전 달">
            ‹
          </IconButton>
          <button
            type="button"
            className="mini-calendar__today-btn"
            onClick={() => onSelectDate?.(new Date())}
          >
            오늘
          </button>
          <IconButton onClick={() => moveMonth(1)} title="다음 달">
            ›
          </IconButton>
        </div>
      </div>

      <div className="mini-calendar__weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day} className="mini-calendar__weekday">
            {day}
          </span>
        ))}
      </div>
      <div className="mini-calendar__grid">
        {days.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className="mini-calendar__cell" />;
          }

          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasEvent = eventDateKeys?.has(toLocalDateKey(date)) ?? false;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={[
                "mini-calendar__cell",
                "mini-calendar__day",
                isToday ? "mini-calendar__day--today" : "",
                isSelected ? "mini-calendar__day--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{date.getDate()}</span>
              {hasEvent && <span className="mini-calendar__dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
// [/SPEC-009:AC-1] [/SPEC-010:AC-1]
