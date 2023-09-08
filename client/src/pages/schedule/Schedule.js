import React, { useState, useRef, useCallback } from "react";
import ScheduleHeader from "./components/ScheduleHeader";
import DaysContainer from "./components/DaysContainer";
import EditEvent from "../eventEditor/EditEvent";
import Modal from "../common/Modal";

function Schedule() {
  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const openEventModal = useCallback(eventid => { setCurrentEvent(eventid); modal.current.open(); }, [modal]);

  // Render
  return (
    <div>
      <ScheduleHeader isEditing={isEditing} setEdit={setEdit} openModal={openEventModal} />

      <DaysContainer isEditing={isEditing} openEventModal={openEventModal} />

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
