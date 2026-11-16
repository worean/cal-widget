import type { CalendarEvent, CalendarSource } from "@/entities/calendar-event/model/types";

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Repository Pattern:
 * UI/비즈니스 로직이 데이터 출처(Mock, Tauri Rust IPC, REST 등)를 모르게 추상화합니다.
 * 나중에 Tauri 백엔드가 준비되면 이 인터페이스를 구현한 TauriCalendarRepository만 교체하면 됩니다.
 */
export interface ICalendarRepository {
  getSources(): Promise<CalendarSource[]>;
  getEvents(range: DateRange): Promise<CalendarEvent[]>;
  syncAll(): Promise<void>;
}
