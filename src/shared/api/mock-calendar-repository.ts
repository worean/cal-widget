import type { CalendarEvent, CalendarSource } from "@/entities/calendar-event/model/types";
import type { DateRange, ICalendarRepository } from "./calendar-repository";

function createDayAt(offsetDays: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const MOCK_SOURCES: CalendarSource[] = [
  {
    id: "src-google-1",
    name: "개인 Google 캘린더",
    provider: "google",
    color: "#4285F4",
    isEnabled: true,
  },
  {
    id: "src-caldav-1",
    name: "업무 CalDAV (Nextcloud)",
    provider: "caldav",
    color: "#10B981",
    isEnabled: true,
  },
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    sourceId: "src-caldav-1",
    provider: "caldav",
    title: "주간 스프린트 미팅",
    location: "온라인 회의실",
    startAt: createDayAt(0, 10, 0),
    endAt: createDayAt(0, 11, 0),
    isAllDay: false,
    color: "#10B981",
  },
  {
    id: "evt-2",
    sourceId: "src-google-1",
    provider: "google",
    title: "Cal-Widget UI 디자인 리뷰",
    description: "### 체크리스트\n- 좌측 시계 + 월간 달력\n- 우측 금일 포함 3일 일정 보드",
    startAt: createDayAt(0, 15, 0),
    endAt: createDayAt(0, 16, 30),
    isAllDay: false,
    color: "#4285F4",
  },
  {
    id: "evt-3",
    sourceId: "src-google-1",
    provider: "google",
    title: "Google / CalDAV API 실데이터 연동",
    location: "홈 오피스",
    startAt: createDayAt(1, 11, 0),
    endAt: createDayAt(1, 12, 30),
    isAllDay: false,
    color: "#4285F4",
  },
  {
    id: "evt-4",
    sourceId: "src-caldav-1",
    provider: "caldav",
    title: "디자인 시스템 컴포넌트 점검",
    startAt: createDayAt(2, 14, 0),
    endAt: createDayAt(2, 15, 0),
    isAllDay: false,
    color: "#10B981",
  },
];

/**
 * 브라우저 단독 개발/테스트용 Mock 구현체
 */
export class MockCalendarRepository implements ICalendarRepository {
  async getSources(): Promise<CalendarSource[]> {
    return MOCK_SOURCES;
  }

  async getEvents(range: DateRange): Promise<CalendarEvent[]> {
    const startMs = range.start.getTime();
    const endMs = range.end.getTime();

    return MOCK_EVENTS.filter((evt) => {
      const evtStart = new Date(evt.startAt).getTime();
      return evtStart >= startMs && evtStart <= endMs;
    });
  }

  async syncAll(): Promise<void> {
    // 네트워크 동기화 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}
