import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "@/entities/calendar-event/model/types";
import { useDependencies } from "@/shared/api/di-container";
import { getTodayRange } from "@/shared/lib/date";

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom Hook (비즈니스 로직 분리):
 * UI 컴포넌트가 Repository 호출, 로딩, 에러 상태를 직접 다루지 않도록 캡슐화합니다.
 */
export function useCalendarEvents(): UseCalendarEventsResult {
  const { calendarRepository } = useDependencies();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getTodayRange();
      const data = await calendarRepository.getEvents(range);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [calendarRepository]);

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
