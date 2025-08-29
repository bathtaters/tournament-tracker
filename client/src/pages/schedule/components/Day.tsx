import type { EventData } from "types/models";
import { useMemo } from "react";
import DragBlock from "pages/common/DragBlock";
import DayEntry from "./DayEntry";
import {
  DaySubtitleStyle,
  DayTitleStyle,
  dragAndDropClass,
} from "../styles/DayStyles";
import {
  dayClasses,
  getToday,
  noDate,
  toDateObj,
} from "../services/date.utils";
import { canDrop, dataType, useUpdateSchedule } from "../services/day.services";
import { weekdays } from "assets/constants";

type DayProps = {
  events: string[];
  isEditing?: boolean;
  isSlotted?: boolean;
  setEventModal?: (eventId: string) => void;
  day: string;
  eventData?: Record<string, EventData>;
  showPlayers?: boolean;
  expandAll?: boolean;
};

export default function Day({
  events,
  isEditing,
  isSlotted,
  setEventModal,
  day,
  eventData,
  showPlayers,
  expandAll,
}: DayProps) {
  // Classes & date as DateObj
  const today = getToday();
  const [{ titleCls, borderCls }, date] = useMemo(
    () => [dayClasses(day, today), toDateObj(day)],
    [day, today],
  );

  // Drag & Drop action
  const dropHandler = useUpdateSchedule();

  return (
    <DragBlock
      type={dataType}
      item={{ day }}
      onDrop={dropHandler}
      dropCheck={canDrop}
      className={dragAndDropClass.outer}
      borderClass={{ disabledColor: borderCls }}
      disabled={(isSlotted && day !== noDate) || !isEditing}
      draggable={false}
    >
      <DayTitleStyle className={titleCls}>
        {date ? weekdays[date.getDay()] : "Unscheduled"}
      </DayTitleStyle>

      <DaySubtitleStyle>
        {date ? date.toLocaleDateString() : ""}
      </DaySubtitleStyle>

      {events.map((eventid, slot) => (
        <DayEntry
          day={day}
          slot={day !== noDate ? slot + 1 : undefined}
          id={eventid}
          data={eventData && eventData[eventid]}
          isEditing={isEditing}
          dropHandler={dropHandler}
          editEvent={setEventModal && (() => setEventModal(eventid))}
          showPlayers={showPlayers}
          expandAll={expandAll}
          key={eventid || slot}
        />
      ))}
    </DragBlock>
  );
}
