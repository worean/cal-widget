import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * 상태나 출처(provider) 등을 표시하는 공용 뱃지
 */
export function Badge({ children, className = "" }: BadgeProps) {
  return <span className={`badge ${className}`}>{children}</span>;
}
