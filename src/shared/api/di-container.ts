import { createContext, useContext } from "react";
import type { ICalendarRepository } from "./calendar-repository";

export interface AppDependencies {
  calendarRepository: ICalendarRepository;
}

export const DependencyContext = createContext<AppDependencies | null>(null);

/**
 * Dependency Injection Hook:
 * 컴포넌트나 Feature 훅이 구체 클래스(Mock vs Tauri)에 직접 의존하지 않도록 합니다.
 */
export function useDependencies(): AppDependencies {
  const ctx = useContext(DependencyContext);
  if (!ctx) {
    throw new Error("useDependencies must be used within DependencyContext.Provider");
  }
  return ctx;
}
