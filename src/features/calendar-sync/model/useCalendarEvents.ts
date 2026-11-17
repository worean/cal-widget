import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "@/entities/calendar-event/model/types";
import { useDependencies } from "@/shared/api/di-container";
// [SPEC-010:AC-1] 선택된 월 전체 범위 조회로 월 달력 도트 및 3일 보드 동시 지원
import { getMonthRange } from "@/shared/lib/date";

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom Hook (비즈니스 로직 분리):
 * 선택된 기준 월의 일정을 조회/동기화합니다.
 */
export function useCalendarEvents(
  selectedDate: Date = new Date(),
): UseCalendarEventsResult {
  const { calendarRepository } = useDependencies();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getMonthRange(new Date(year, month, 1));
      const data = await calendarRepository.getEvents(range);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [calendarRepository, year, month]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await calendarRepository.syncAll();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "동기화에 실패했습니다.");
      setIsLoading(false);
    }
  }, [calendarRepository, loadEvents]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return { events, isLoading, error, refresh };
}
// [/SPEC-010:AC-1]
