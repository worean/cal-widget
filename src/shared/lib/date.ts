export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// [SPEC-009:AC-2] 금일 포함 3일(오늘·내일·모레) 조회 범위 및 날짜 버킷 헬퍼
export function getThreeDayRange(baseDate = new Date()): { start: Date; end: Date } {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setDate(end.getDate() + 2);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function toLocalDateKey(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DayBucket {
  key: string;
  title: string;
  dateLabel: string;
  isToday: boolean;
}

// [SPEC-010:AC-1] 선택된 월 전체 범위 조회 헬퍼
export function getMonthRange(baseDate = new Date()): { start: Date; end: Date } {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getThreeDayBuckets(baseDate = new Date()): DayBucket[] {
  const todayKey = toLocalDateKey(new Date());
  return [0, 1, 2].map((offset) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);
    const key = toLocalDateKey(d);
    const isToday = key === todayKey;
    const title = isToday ? "오늘" : offset === 0 ? "선택일" : `+${offset}일`;
    const dateLabel = d.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    return {
      key,
      title,
      dateLabel,
      isToday,
    };
  });
}
// [/SPEC-010:AC-1]
// [/SPEC-009:AC-2]

export function formatTimeRange(startIso: string, endIso: string, isAllDay: boolean): string {
  if (isAllDay) return "종일";

  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const start = new Date(startIso).toLocaleTimeString("ko-KR", opts);
  const end = new Date(endIso).toLocaleTimeString("ko-KR", opts);
  return `${start} - ${end}`;
}

export function formatTodayHeader(): string {
  return new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
