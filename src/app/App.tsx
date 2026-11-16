import { useState } from "react";
import { MascotPage } from "@/pages/mascot";
import { SettingsPage } from "@/pages/settings/ui/SettingsPage";
import { WidgetPage } from "@/pages/widget/ui/WidgetPage";
import { AppProviders } from "./providers/AppProviders";

type ActiveView = "widget" | "settings";

// [SPEC-007:AC-1] URL 쿼리(?window=mascot)에 따른 멀티 윈도우 페이지 분기
function getWindowMode(): "main" | "mascot" {
  if (typeof window === "undefined") return "main";
  const params = new URLSearchParams(window.location.search);
  return params.get("window") === "mascot" ? "mascot" : "main";
}
// [/SPEC-007:AC-1]

export function App() {
  const [view, setView] = useState<ActiveView>("widget");
  const windowMode = getWindowMode();

  return (
    <AppProviders>
      {windowMode === "mascot" ? (
        <MascotPage />
      ) : view === "widget" ? (
        <WidgetPage onOpenSettings={() => setView("settings")} />
      ) : (
        <SettingsPage onBack={() => setView("widget")} />
      )}
    </AppProviders>
  );
}
