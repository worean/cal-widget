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
  const { events, isLoading, error, refresh } = useCalendarEvents();

  return (
    <main className="widget-layout">
      <CharacterPetWidget upcomingCount={events.length} />
      <CalendarBoardWidget
        events={events}
        isLoading={isLoading}
        error={error}
        onRefresh={() => void refresh()}
        onOpenSettings={onOpenSettings}
      />
    </main>
  );
}
