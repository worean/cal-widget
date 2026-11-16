import { Badge, MarkdownText, TimeRange, Tooltip } from "@/shared/ui";
import type { CalendarEvent } from "../model/types";

interface EventCardProps {
  event: CalendarEvent;
}

/**
 * 단일 일정 카드 컴포넌트
 * 공용 컴포넌트(TimeRange, Badge, Tooltip, MarkdownText)를 조합해 구성합니다.
 */
export function EventCard({ event }: EventCardProps) {
  const accentColor = event.color ?? "#4285F4";

  const cardBody = (
    <li className="event-card">
      <span
        className="event-card__bar"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />
      <div className="event-card__body">
        <div className="event-card__title">{event.title}</div>
        <div className="event-card__meta">
          <TimeRange
            startAt={event.startAt}
            endAt={event.endAt}
            isAllDay={event.isAllDay}
          />
          {event.location && <span>· {event.location}</span>}
          <Badge>{event.provider}</Badge>
        </div>
      </div>
    </li>
  );

  if (!event.description) {
    return cardBody;
  }

  return (
    <Tooltip content={<MarkdownText content={event.description} />} position="bottom">
      {cardBody}
    </Tooltip>
  );
}
