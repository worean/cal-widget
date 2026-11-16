import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
}

/**
 * 캐릭터 대사/알림용 말풍선 공용 컴포넌트
 */
export function SpeechBubble({ children, className = "" }: SpeechBubbleProps) {
  return <div className={`speech-bubble ${className}`}>{children}</div>;
}
