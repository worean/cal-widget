import { invoke } from "@tauri-apps/api/core";
import type { CalendarEvent, CalendarSource } from "@/entities/calendar-event";
import type { DateRange, ICalendarRepository } from "./calendar-repository";

// [SPEC-003:AC-3] Tauri Rust SQLite 백엔드와 통신하는 Repository 구현체
export class TauriCalendarRepository implements ICalendarRepository {
  async getSources(): Promise<CalendarSource[]> {
    return invoke<CalendarSource[]>("get_calendar_sources");
  }

  async getEvents(range: DateRange): Promise<CalendarEvent[]> {
    return invoke<CalendarEvent[]>("get_calendar_events", {
      startAt: range.start.toISOString(),
      endAt: range.end.toISOString(),
    });
  }

  async syncAll(): Promise<void> {
    await invoke("sync_calendars");
  }
}
// [/SPEC-003:AC-3]
