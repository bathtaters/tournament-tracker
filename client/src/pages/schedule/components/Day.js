import React, { useMemo } from "react";
import PropTypes from 'prop-types';

import DayEntry from "./DayEntry";
import { DayTitleStyle, DaySubtitleStyle, dragAndDropClass } from "../styles/DayStyles";
import DragBlock from "../../common/DragBlock";

import { toDateObj, getToday, dayClasses, noDate } from '../services/date.utils';
import { useUpdateSchedule, canDrop, dataType } from "../services/day.services";
import { weekdays } from '../../../assets/constants';


function Day({ events, isEditing, isSlotted, setEventModal, day, eventData }) {
  // Classes & date as DateObj
  const today = getToday();
  const [ { titleCls, borderCls }, date ] = useMemo(() => [ dayClasses(day, today), toDateObj(day) ], [day, today]);

  // Drag & Drop action
  const dropHandler = useUpdateSchedule();

  return (
    <DragBlock
      storeData={{ day }}
      storeTestData={day}
      onDrop={dropHandler}
      canDrop={canDrop}
      className={dragAndDropClass.outer}
      borderClass={{disabledColor: borderCls.slice(7)}}
      dataType={dataType}
      disabled={(isSlotted && day !== noDate) || !isEditing}
      draggable={false}
    >
      <DayTitleStyle className={titleCls}>{date ? weekdays[date.getDay()] : 'Unscheduled'}</DayTitleStyle>

      <DaySubtitleStyle>{date ? date.toLocaleDateString() : ''}</DaySubtitleStyle>

      { events.map((eventid,slot) => 
        <DayEntry
          day={day}
          slot={day !== noDate && slot + 1}
          id={eventid}
          data={eventData && eventData[eventid]}
          isEditing={isEditing}
          dropHandler={dropHandler}
          editEvent={()=>setEventModal(eventid)}
          key={eventid || slot}
        />
      )}
    </DragBlock>
  );
}

Day.propTypes = {
  events: PropTypes.arrayOf(PropTypes.string),
  isEditing: PropTypes.bool,
  setEventModal: PropTypes.func,
  day: PropTypes.string,
};

export default Day;