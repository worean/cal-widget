import { useState, type FormEvent } from "react";

// [SPEC-004:AC-4] [SPEC-005:AC-3] Google OAuth / CalDAV 계정 연결 폼
interface AccountConnectFormProps {
  isSubmitting: boolean;
  onConnectGoogle: (
    displayName: string,
    clientId: string,
    clientSecret: string,
  ) => Promise<void>;
  onAddCalDav: (
    displayName: string,
    calendarUrl: string,
    username: string,
    password: string,
  ) => Promise<void>;
}

export function AccountConnectForm({
  isSubmitting,
  onConnectGoogle,
  onAddCalDav,
}: AccountConnectFormProps) {
  const [tab, setTab] = useState<"google" | "caldav">("google");

  const [googleName, setGoogleName] = useState("개인 Google 캘린더");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [caldavName, setCaldavName] = useState("업무 CalDAV");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === "google") {
      if (!clientId.trim() || !clientSecret.trim()) return;
      void onConnectGoogle(
        googleName.trim() || "Google 캘린더",
        clientId.trim(),
        clientSecret.trim(),
      );
    } else {
      if (!calendarUrl.trim() || !username.trim() || !password.trim()) return;
      void onAddCalDav(
        caldavName.trim() || "CalDAV 캘린더",
        calendarUrl.trim(),
        username.trim(),
        password.trim(),
      );
    }
  };

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <div className="account-form__tabs">
        <button
          type="button"
          className={`account-form__tab ${tab === "google" ? "account-form__tab--active" : ""}`}
          onClick={() => setTab("google")}
        >
          Google OAuth
        </button>
        <button
          type="button"
          className={`account-form__tab ${tab === "caldav" ? "account-form__tab--active" : ""}`}
          onClick={() => setTab("caldav")}
        >
          CalDAV
        </button>
      </div>

      {tab === "google" ? (
        <>
          <input
            className="account-form__input"
            placeholder="표시 이름 (예: 개인 Google)"
            value={googleName}
            onChange={(e) => setGoogleName(e.target.value)}
          />
          <input
            className="account-form__input"
            placeholder="Google OAuth Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
          <input
            className="account-form__input"
            type="password"
            placeholder="Google OAuth Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
          />
        </>
      ) : (
        <>
          <input
            className="account-form__input"
            placeholder="표시 이름 (예: iCloud / Nextcloud)"
            value={caldavName}
            onChange={(e) => setCaldavName(e.target.value)}
          />
          <input
            className="account-form__input"
            placeholder="CalDAV 캘린더 URL"
            value={calendarUrl}
            onChange={(e) => setCalendarUrl(e.target.value)}
            required
          />
          <input
            className="account-form__input"
            placeholder="계정 이메일 / 사용자명"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="account-form__input"
            type="password"
            placeholder="비밀번호 또는 앱 전용 암호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </>
      )}

      <button
        type="submit"
        className="account-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "연결 중..."
          : tab === "google"
            ? "브라우저로 Google 로그인"
            : "CalDAV 계정 추가"}
      </button>
    </form>
  );
}
// [/SPEC-004:AC-4] [/SPEC-005:AC-3]
