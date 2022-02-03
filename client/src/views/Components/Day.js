import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import DragBlock from './DragBlock';

import { noDate, toDateObj, dayClasses } from '../../controllers/getDays';
import { isTempId } from "../../controllers/misc";
import { formatQueryError, weekdays, statusInfo } from '../../assets/strings';

import { usePrefetch, } from "../../models/baseApi";
import { useEventQuery, useUpdateEventMutation, } from "../../models/eventApi";

// Component
function Day({ events, isEditing, setEventModal, day }) {
  // Definitions (memoize?)
  const { titleCls, borderCls } = dayClasses(day);
  const date = toDateObj(day);
  const canDrop = useCallback(types => types.includes("json/eventday"), []);

  // Global state
  const { data, isLoading, error } = useEventQuery();
  const [ updateEvent ] = useUpdateEventMutation();
  
  // Actions
  const dropHandler = (a,b) => {
    [a.day, b.day] = [b.day, a.day].map(d => d === noDate ? null : d);
    updateEvent(a);
    if (b.id) updateEvent(b);
  }

  return (
    <DragBlock
      storeData={{ id: null, day }}
      onDrop={dropHandler}
      canDrop={canDrop}
      className="p-2 m-1 rounded-md w-40 min-h-32"
      borderClass={{disabledColor:borderCls, disabledOpacity:'100', baseOpacity:'100'}}
      dataType="json/eventday"
      disabled={!isEditing}
      draggable={false}
    >
      <h4 className={'text-2xl font-light text-center pointer-events-none ' + (titleCls)}>
        {date ? weekdays[date.getDay()] : 'Unscheduled'}
      </h4>
      <h5 className="text-center italic text-sm font-thin mb-2 pointer-events-none">
        {date ? date.toLocaleDateString() : ''}
      </h5>
      { isLoading ?
        <div className="text-center text-sm font-light dim-color italic pointer-events-none opacity-60">
          ...
        </div>

      : error ?
        <div className="text-center text-sm font-light dim-color italic pointer-events-none opacity-60">
          {formatQueryError(error)}
        </div>

      : events && events.length ?
        events.map(eventid => 
          <DayEntry
            day={day}
            id={eventid}
            data={data && data[eventid]}
            canDrop={canDrop}
            isEditing={isEditing}
            dropHandler={dropHandler}
            editEvent={()=>setEventModal(eventid)}
            key={eventid}
          />
        )

      : !isEditing &&
        <div className="text-center text-sm font-light dim-color italic pointer-events-none opacity-60">
          No events
        </div>
      }
    </DragBlock>
  );
}


function DayEntry({ day, id, data, isEditing, canDrop, dropHandler, editEvent }) {
  // Setup prefetching
  const prefetchEvent = usePrefetch('event');
  const prefetchMatch = usePrefetch('match');
  const prefetchStats = usePrefetch('stats');
  const loadEvent = id => { prefetchEvent(id); prefetchMatch(id); prefetchStats(id); };

  if (!data || isTempId(id))
    return <div className="text-sm font-thin text-center dim-color pointer-events-none">...</div>

  return (
    <DragBlock
      storeData={{ id, day }}
      onDrop={dropHandler}
      canDrop={canDrop}
      className="relative p-1 m-1 rounded-xl text-center"
      dataType="json/eventday"
      disabled={!isEditing}
      onHover={()=>loadEvent(id)}
    >
      { isEditing ? <>
        <div
          className={
            'text-sm font-normal pointer-events-none ' +
            (data.isDone ? 'dim-color' : 'link-color')
          }
        >
          {data.title}
        </div>
        
        { data.status < 3 &&
          <div
            className={
              'absolute top-0 right-1 text-sm font-normal cursor-pointer hover:' +
              statusInfo[data.status].class
            }
            onClick={editEvent}
          >{"✐"}</div>
        }
      </>:
        <Link
          className={
            'text-sm font-normal block ' + 
            (data.status === 1 ? '' : statusInfo[data.status + 1].class)
          }
          to={'/event/'+id}
        >
          {data.title}
        </Link>
      }
      
    </DragBlock>
  );
}

DayEntry.propTypes = {
  day: PropTypes.string,
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  canDrop: PropTypes.func,
  dropHandler: PropTypes.func,
  editEvent: PropTypes.func,
};

Day.propTypes = {
  events: PropTypes.arrayOf(PropTypes.string),
  isEditing: PropTypes.bool,
  setEventModal: PropTypes.func,
  day: PropTypes.string,
};

export default Day;