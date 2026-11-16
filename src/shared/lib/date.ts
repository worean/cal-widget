export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

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
