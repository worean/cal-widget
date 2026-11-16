import type { CalendarEvent, CalendarSource } from "@/entities/calendar-event/model/types";
import type { DateRange, ICalendarRepository } from "./calendar-repository";

function createTodayAt(hour: number, minute = 0): string {
  const date = new Date();
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
    startAt: createTodayAt(10, 0),
    endAt: createTodayAt(11, 0),
    isAllDay: false,
    color: "#10B981",
  },
  {
    id: "evt-2",
    sourceId: "src-google-1",
    provider: "google",
    title: "Tauri 위젯 아키텍처 학습",
    description: "### 오늘의 학습 목표\n- **FSD** 폴더 구조 이해하기\n- `Repository` 패턴으로 데이터 분리",
    startAt: createTodayAt(14, 30),
    endAt: createTodayAt(16, 0),
    isAllDay: false,
    color: "#4285F4",
  },
  {
    id: "evt-3",
    sourceId: "src-google-1",
    provider: "google",
    title: "저녁 운동",
    startAt: createTodayAt(19, 0),
    endAt: createTodayAt(20, 0),
    isAllDay: false,
    color: "#F59E0B",
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
