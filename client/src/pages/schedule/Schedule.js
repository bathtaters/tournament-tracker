import React, { useState, useRef, useCallback } from "react";

import ScheduleHeader from "./components/ScheduleHeader";
import Day from "./components/Day";
import EditEvent from "../eventEditor/EditEvent";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import RawData from "../common/RawData";
import { DaysContainerStyle } from "./styles/ScheduleStyles";

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
  const isLoading = schedLoad || settingsLoad || eventsLoad,
    error  = schedErr || settingsErr || eventsErr,
    noData = isLoading || error || !data || !settings || !eventData;

  // Render
  return (
    <div>
      <ScheduleHeader isEditing={isEditing} isLoading={noData} setEdit={setEdit} openModal={openEventModal} />

      <DaysContainerStyle>
        { noData ?
          <Loading loading={isLoading} error={error} altMsg="Unable to reach server"  tagName="h4" />

        : data.map(({ day, events }) => 
          <Day
            key={day}
            day={day}
            events={events}
            eventData={eventData}
            isEditing={isEditing}
            isSlotted={Boolean(settings.dayslots)}
            setEventModal={openEventModal}
          />
        )}
      </DaysContainerStyle>

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
