import { useState } from "react";
import { useCalendarEvents } from "@/features/calendar-sync";
import { CalendarBoardWidget } from "@/widgets/calendar-board";
import { CharacterPetWidget } from "@/widgets/character-pet";

interface WidgetPageProps {
  onOpenSettings: () => void;
}

/**
 * 바탕화면 위젯 메인 페이지
 * 각 슬라이스의 Public API(index.ts)를 통해서만 import합니다.
 */
export function WidgetPage({ onOpenSettings }: WidgetPageProps) {
  // [SPEC-010:AC-1] 달력 선택 날짜를 기준으로 캘린더와 3일 보드를 동기화
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { events, isLoading, error, refresh } = useCalendarEvents(selectedDate);

  return (
    <main className="widget-layout">
      <CharacterPetWidget upcomingCount={events.length} />
      <CalendarBoardWidget
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        events={events}
        isLoading={isLoading}
        error={error}
        onRefresh={() => void refresh()}
        onOpenSettings={onOpenSettings}
      />
    </main>
  );
  // [/SPEC-010:AC-1]
}
