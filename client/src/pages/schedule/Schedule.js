import React, { useState, useRef, useCallback } from "react";

import Day from "./components/Day";
import EditEvent from "../eventEditor/EditEvent";
import Modal from "../common/Modal";
import RawData from "../common/RawData";

import { useScheduleQuery, useSettingsQuery, useEventQuery } from "./schedule.fetch";

import { formatQueryError } from "../../assets/strings";
import { noDate, getMissingEvents } from "./services/day.services";

function Schedule() {
  // Global state
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useScheduleQuery();
  
  const { data: eventData } = useEventQuery();
  const otherEvents = getMissingEvents(data,settings.dateRange);

  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const openEventModal = useCallback(eventid => { setCurrentEvent(eventid); modal.current.open(); }, [modal]);

  return (
    <div>
      <div className="flex justify-evenly items-center">
        <input
          className="sm:w-20 sm:h-11"
          disabled={isLoading}
          onClick={()=>openEventModal()}
          type="button"
          value="+"
        />
        <h2 className="inline-block text-center font-thin">Schedule</h2>
        <input
          className="sm:w-20 sm:h-11"
          disabled={isLoading}
          onClick={()=>setEdit(!isEditing)}
          type="button"
          value={isEditing ? 'Back' : 'Edit'}
        />
      </div>

      <div className="flex flex-wrap justify-center mt-4">
        { isLoading || error || !settings ?
          <h4 className="text-center">{isLoading ? 'Loading...' : formatQueryError(error || 'Unable to reach server')}</h4>
        :
          settings.dateRange && settings.dateRange.map(day => 
            <Day
              day={day}
              events={day === noDate ? otherEvents : data[day] && data[day].events}
              isEditing={isEditing}
              key={day}
              setEventModal={openEventModal}
            />
          )
        }
      </div>

      <RawData data={data} />
      <RawData className="text-xs" data={eventData} />

      <Modal ref={modal}>
        <EditEvent
          eventid={currentEvent}
          hideModal={force=>modal.current.close(force)}
          lockModal={()=>modal.current.lock()}
        />
      </Modal>
    </div>
  );
}

export default Schedule;
