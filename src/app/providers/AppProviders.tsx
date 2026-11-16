import { useMemo, type ReactNode } from "react";
import { DependencyContext } from "@/shared/api/di-container";
import { MockCalendarRepository } from "@/shared/api/mock-calendar-repository";
import { TauriCalendarRepository } from "@/shared/api/tauri-calendar-repository";
import { isTauriRuntime } from "@/shared/lib/platform";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composition Root:
 * 앱 전역에서 사용할 Repository 구현체를 조립해 주입합니다.
 */
export function AppProviders({ children }: AppProvidersProps) {
  // [SPEC-003:AC-3] 런타임 환경에 따라 Tauri SQLite 또는 브라우저 Mock 저장소 자동 주입
  const dependencies = useMemo(
    () => ({
      calendarRepository: isTauriRuntime()
        ? new TauriCalendarRepository()
        : new MockCalendarRepository(),
    }),
    [],
  );
  // [/SPEC-003:AC-3]

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}
