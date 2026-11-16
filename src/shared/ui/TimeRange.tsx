import { formatTimeRange } from "@/shared/lib/date";

interface TimeRangeProps {
  startAt: string;
  endAt: string;
  isAllDay?: boolean;
  className?: string;
}

/**
 * 시간 범위 출력 전용 공용 컴포넌트
 * 향후 12h/24h 포맷 설정이나 타임존 옵션이 추가되어도 이 컴포넌트만 수정하면 됩니다.
 */
export function TimeRange({
  startAt,
  endAt,
  isAllDay = false,
  className = "",
}: TimeRangeProps) {
  return (
    <time className={`time-range ${className}`} dateTime={startAt}>
      {formatTimeRange(startAt, endAt, isAllDay)}
    </time>
  );
}
