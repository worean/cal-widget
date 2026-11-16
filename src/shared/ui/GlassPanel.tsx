import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * 바탕화면 위젯용 반투명(Glassmorphism) 기본 컨테이너
 */
export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return <div className={`glass-panel ${className}`}>{children}</div>;
}
