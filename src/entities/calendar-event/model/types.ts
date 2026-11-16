/**
 * 모든 외부 캘린더(Google, CalDAV, ICS, Local)를 하나의 규격으로 다루기 위한
 * 통합 도메인 모델입니다.
 */
export type CalendarProviderType = "google" | "caldav" | "ics" | "local";

export interface CalendarSource {
  id: string;
  name: string;
  provider: CalendarProviderType;
  color: string;
  isEnabled: boolean;
}

export interface CalendarEvent {
  id: string;
  sourceId: string;
  provider: CalendarProviderType;
  title: string;
  description?: string;
  location?: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
  isAllDay: boolean;
  color?: string;
}
