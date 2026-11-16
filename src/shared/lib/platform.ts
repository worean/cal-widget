// [SPEC-001:AC-2] Tauri 데스크톱 웹뷰 런타임 판별
/**
 * 현재 실행 환경이 Tauri 데스크톱 웹뷰인지 브라우저 단독 실행인지 판별합니다.
 */
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
// [/SPEC-001:AC-2]
