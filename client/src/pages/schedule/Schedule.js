import React, { useState, useRef, useCallback } from "react";

import ScheduleHeader from "./components/ScheduleHeader";
import Day from "./components/Day";
import EditEvent from "../eventEditor/EditEvent";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import RawData from "../common/RawData";
import { DaysStyle } from "./styles/ScheduleStyles";

import { noDate, getMissingEvents } from "./services/date.services";
import { useScheduleQuery, useSettingsQuery, useEventQuery } from "./schedule.fetch";

function Schedule() {
  // Global state
  const { data,            isLoading: schedLoad,    error: schedErr    } = useScheduleQuery();
  const { data: settings,  isLoading: settingsLoad, error: settingsErr } = useSettingsQuery();
  const { data: eventData, isLoading: eventsLoad,   error: eventsErr   } = useEventQuery();
  
  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const openEventModal = useCallback(eventid => { setCurrentEvent(eventid); modal.current.open(); }, [modal]);

  // Calculated
  const isLoading = schedLoad || settingsLoad || eventsLoad, error = schedErr || settingsErr || eventsErr;
  const notLoaded = isLoading || error || !data || !settings || !eventData;
  const otherEvents = getMissingEvents(data, settings.dateRange);

  // Render
  return (
    <div>
      <ScheduleHeader isEditing={isEditing} isLoading={notLoaded} setEdit={setEdit} openModal={openEventModal} />

      <DaysStyle>
        { notLoaded ?
          <Loading loading={isLoading} error={error} altMsg="Unable to reach server"  TagName="h4" />

        : (settings.dateRange || []).map(day => 
          <Day
            key={day}
            day={day}
            events={day === noDate ? otherEvents : data[day] && data[day].events}
            eventData={eventData}
            isEditing={isEditing}
            setEventModal={openEventModal}
          />
        )}
      </DaysStyle>

      <RawData data={data} />
      <RawData className="text-xs" data={eventData} />

      <Modal ref={modal}>
        <EditEvent
          eventid={currentEvent}
          modal={modal}
        />
      </Modal>
    </div>
  );
}

export default Schedule;
