import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { isTauriRuntime } from "@/shared/lib/platform";
import { App } from "./app/App";
import "./app/styles/global.css";

// [SPEC-001:AC-2] Tauri 런타임일 때 투명 창 스타일 분기를 위한 루트 속성 설정
if (isTauriRuntime()) {
  document.documentElement.dataset.runtime = "tauri";
}
// [/SPEC-001:AC-2]

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
