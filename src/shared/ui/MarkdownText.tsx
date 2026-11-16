import type { ReactNode } from "react";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * 인라인 마크다운(**bold**, *italic*, `code`)을 React 노드로 변환합니다.
 */
function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

/**
 * 공용 마크다운 텍스트 렌더러
 * Tooltip, 일정 상세 설명, 캐릭터 대사 등 여러 곳에서 재사용합니다.
 * 추후 GFM/테이블 등 고급 문법이 필요해지면 내부 구현만 react-markdown으로 교체하면 됩니다.
 */
export function MarkdownText({ content, className = "" }: MarkdownTextProps) {
  const lines = content.split("\n");

  return (
    <div className={`markdown-text ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="markdown-text__spacer" />;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="markdown-text__list-item">
              <span aria-hidden="true">•</span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="markdown-text__h4">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }
        return (
          <p key={idx} className="markdown-text__p">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}
