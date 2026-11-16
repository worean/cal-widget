import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "@/shared/lib/platform";

// [SPEC-004:AC-4] [SPEC-005:AC-3] 외부 캘린더 계정 연동/삭제 상태 관리 훅
export interface ProviderAccount {
  id: string;
  provider: "google" | "caldav" | string;
  displayName: string;
  calendarUrl?: string;
}

export function useCalendarAccounts() {
  const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!isTauriRuntime()) return;
    try {
      const list = await invoke<ProviderAccount[]>("list_provider_accounts_cmd");
      setAccounts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const connectGoogle = useCallback(
    async (displayName: string, clientId: string, clientSecret: string) => {
      if (!isTauriRuntime()) {
        setError("Google OAuth 연동은 Tauri 데스크톱 앱에서 실행해주세요.");
        return;
      }
      setIsSubmitting(true);
      setError(null);
      try {
        await invoke("connect_google_account", {
          displayName,
          clientId,
          clientSecret,
        });
        await loadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts],
  );

  const addCalDav = useCallback(
    async (
      displayName: string,
      calendarUrl: string,
      username: string,
      password: string,
    ) => {
      if (!isTauriRuntime()) {
        setError("CalDAV 연동은 Tauri 데스크톱 앱에서 실행해주세요.");
        return;
      }
      setIsSubmitting(true);
      setError(null);
      try {
        await invoke("add_caldav_account", {
          displayName,
          calendarUrl,
          username,
          password,
        });
        await loadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts],
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      if (!isTauriRuntime()) return;
      setError(null);
      try {
        await invoke("remove_provider_account", { accountId });
        await loadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [loadAccounts],
  );

  return {
    accounts,
    isSubmitting,
    error,
    connectGoogle,
    addCalDav,
    removeAccount,
  };
}
// [/SPEC-004:AC-4] [/SPEC-005:AC-3]
