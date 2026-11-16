import { useState, type ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}

/**
 * 공용 Tooltip 컴포넌트
 * content에 문자열뿐만 아니라 MarkdownText 같은 ReactNode를 그대로 전달할 수 있습니다.
 */
export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div role="tooltip" className={`tooltip-box tooltip-box--${position}`}>
          {content}
        </div>
      )}
    </div>
  );
}
