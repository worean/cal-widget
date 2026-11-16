import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * 공용 아이콘 버튼 컴포넌트
 */
export function IconButton({ children, className = "", ...props }: IconButtonProps) {
  return (
    <button type="button" className={`icon-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
