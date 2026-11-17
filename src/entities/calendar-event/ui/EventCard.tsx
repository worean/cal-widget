import { useState } from "react";
import { Badge, MarkdownText, TimeRange, Tooltip } from "@/shared/ui";
import type { CalendarEvent } from "../model/types";

interface EventCardProps {
  event: CalendarEvent;
}

// [SPEC-010:AC-2] 클릭 시 상세 마크다운 설명을 펼치고 접을 수 있는 일정 카드
export function EventCard({ event }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = event.color ?? "#4285F4";
  const hasDescription = Boolean(event.description?.trim());

  const cardBody = (
    <li
      className={`event-card ${hasDescription ? "event-card--interactive" : ""}`}
      onClick={() => {
        if (hasDescription) setExpanded((prev) => !prev);
      }}
    >
      <span
        className="event-card__bar"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />
      <div className="event-card__body">
        <div className="event-card__title-row">
          <span className="event-card__title">{event.title}</span>
          {hasDescription && (
            <span className="event-card__chevron">{expanded ? "▴" : "▾"}</span>
          )}
        </div>
        <div className="event-card__meta">
          <TimeRange
            startAt={event.startAt}
            endAt={event.endAt}
            isAllDay={event.isAllDay}
          />
          {event.location && <span>· {event.location}</span>}
          <Badge>{event.provider}</Badge>
        </div>
        {expanded && event.description && (
          <div className="event-card__details">
            <MarkdownText content={event.description} />
          </div>
        )}
      </div>
    </li>
  );

  if (!hasDescription || expanded) {
    return cardBody;
  }

  return (
    <Tooltip content={<MarkdownText content={event.description!} />} position="bottom">
      {cardBody}
    </Tooltip>
  );
}
// [/SPEC-010:AC-2]
