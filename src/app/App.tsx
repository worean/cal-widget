import { useState } from "react";
import { SettingsPage } from "@/pages/settings/ui/SettingsPage";
import { WidgetPage } from "@/pages/widget/ui/WidgetPage";
import { AppProviders } from "./providers/AppProviders";

type ActiveView = "widget" | "settings";

export function App() {
  const [view, setView] = useState<ActiveView>("widget");

  return (
    <AppProviders>
      {view === "widget" ? (
        <WidgetPage onOpenSettings={() => setView("settings")} />
      ) : (
        <SettingsPage onBack={() => setView("widget")} />
      )}
    </AppProviders>
  );
}
