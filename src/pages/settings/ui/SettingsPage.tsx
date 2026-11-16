import { useEffect, useState } from "react";
import type { CalendarSource } from "@/entities/calendar-event";
import {
  AccountConnectForm,
  useCalendarAccounts,
} from "@/features/calendar-accounts";
import { useDependencies } from "@/shared/api/di-container";
import { Badge, GlassPanel, IconButton } from "@/shared/ui";

interface SettingsPageProps {
  onBack: () => void;
}

/**
 * 계정 연동(Google Calendar / CalDAV) 및 위젯 설정 페이지
 */
export function SettingsPage({ onBack }: SettingsPageProps) {
  const { calendarRepository } = useDependencies();
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const {
    accounts,
    isSubmitting,
    error,
    connectGoogle,
    addCalDav,
    removeAccount,
  } = useCalendarAccounts();

  useEffect(() => {
    void calendarRepository.getSources().then(setSources);
  }, [calendarRepository, accounts]);

  return (
    <main className="widget-layout">
      <GlassPanel className="settings-panel">
        <header className="calendar-board__header">
          <div>
            <span className="calendar-board__eyebrow">SETTINGS</span>
            <h2 className="calendar-board__title">캘린더 연동 관리</h2>
          </div>
          <IconButton onClick={onBack} title="위젯으로 돌아가기">
            ✕
          </IconButton>
        </header>

        <section className="settings-section">
          <h3 className="settings-section__title">연결된 캘린더 소스</h3>
          <ul className="source-list">
            {sources.map((src) => (
              <li key={src.id} className="source-item">
                <span
                  className="source-item__dot"
                  style={{ backgroundColor: src.color }}
                />
                <span className="source-item__name">{src.name}</span>
                <Badge>{src.provider}</Badge>
                {accounts.some((acc) => acc.id === src.id) && (
                  <IconButton
                    onClick={() => void removeAccount(src.id)}
                    title="연동 해제"
                  >
                    🗑
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* [SPEC-004:AC-4] [SPEC-005:AC-3] Google OAuth / CalDAV 계정 추가 폼 */}
        <section className="settings-section">
          <h3 className="settings-section__title">새 캘린더 계정 추가</h3>
          {error && (
            <p className="calendar-board__status calendar-board__status--error">
              {error}
            </p>
          )}
          <AccountConnectForm
            isSubmitting={isSubmitting}
            onConnectGoogle={connectGoogle}
            onAddCalDav={addCalDav}
          />
        </section>
        {/* [/SPEC-004:AC-4] [/SPEC-005:AC-3] */}
      </GlassPanel>
    </main>
  );
}
