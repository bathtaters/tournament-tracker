import React, { useCallback, useMemo } from "react";
import PropTypes from 'prop-types';

import DayEntry from "./DayEntry";
import DragBlock from '../../common/DragBlock';
import {
  TitleStyle, SubTitleStyle,
  MissingDataStyle, dragAndDropClass
} from "../styles/DayStyles";

import { useSetEventMutation } from "../schedule.fetch";
import { toDateObj, dayClasses } from '../services/date.services';
import { canDrop, dropController, dataType } from "../services/day.services";

import { weekdays } from '../../../assets/strings';


// Component
function Day({ events, isEditing, setEventModal, day, eventData }) {
  // Classes & date as DateObj
  const [ { titleCls, borderCls }, date ] = useMemo(() => [ dayClasses(day), toDateObj(day) ], [day]);
  
  // Drag & Drop action
  const [ updateEvent ] = useSetEventMutation();
  const dropHandler = useCallback(dropController(updateEvent), [updateEvent]);

  return (
    <DragBlock
      storeData={{ id: null, day }}
      onDrop={dropHandler}
      canDrop={canDrop}
      className={dragAndDropClass.outer}
      borderClass={{disabledColor:borderCls, disabledOpacity:'100', baseOpacity:'100'}}
      dataType={dataType}
      disabled={!isEditing}
      draggable={false}
    >

      <TitleStyle className={titleCls}>{date ? weekdays[date.getDay()] : 'Unscheduled'}</TitleStyle>

      <SubTitleStyle>{date ? date.toLocaleDateString() : ''}</SubTitleStyle>

      { events && events.length ?
        events.map(eventid => 
          <DayEntry
            day={day}
            id={eventid}
            data={eventData && eventData[eventid]}
            isEditing={isEditing}
            dropHandler={dropHandler}
            editEvent={()=>setEventModal(eventid)}
            key={eventid}
          />
        )
      : !isEditing && (<MissingDataStyle>No events</MissingDataStyle>)
      }
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