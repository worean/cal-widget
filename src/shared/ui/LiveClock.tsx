import { useEffect, useState } from "react";

// [SPEC-009:AC-1] 좌측 월 달력 상단 실시간 시계 및 날짜 표시 공용 컴포넌트
export function LiveClock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const dateLabel = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className={`live-clock ${className}`}>
      <div className="live-clock__time">
        <span>
          {hours}:{minutes}
        </span>
        <span className="live-clock__sec">{seconds}</span>
      </div>
      <div className="live-clock__date">{dateLabel}</div>
    </div>
  );
}
// [/SPEC-009:AC-1]
