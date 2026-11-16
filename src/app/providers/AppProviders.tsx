import { useMemo, type ReactNode } from "react";
import { DependencyContext } from "@/shared/api/di-container";
import { MockCalendarRepository } from "@/shared/api/mock-calendar-repository";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 *Composition Root:
 * 앱 전역에서 사용할 Repository 구현체를 조립해 주입합니다.
 * Tauri 환경 여부에 따라 Mock / TauriCalendarRepository를 분기할 수 있습니다.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const dependencies = useMemo(
    () => ({
      calendarRepository: new MockCalendarRepository(),
    }),
    [],
  );

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}
