import { useState, useRef, useCallback } from "react";
import ScheduleHeader from "./components/ScheduleHeader";
import DaysContainer from "./components/DaysContainer";
import EditEvent from "../eventEditor/EditEvent";
import Settings from "../settings/Settings";
import Modal from "../common/Modal";

function Schedule() {
  // Local state
  const eventModal = useRef(null);
  const settingsModal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const openEventModal = useCallback(eventid => { setCurrentEvent(eventid); eventModal.current.open(); }, []);

  // Render
  return (
    <div>
      <ScheduleHeader isEditing={isEditing} setEdit={setEdit} openModal={openEventModal} />

      <DaysContainer isEditing={isEditing} openEventModal={openEventModal} />

      <Modal ref={eventModal}>
        <EditEvent
          eventid={currentEvent}
          modal={eventModal}
        />
      </Modal>

      <Modal ref={settingsModal}>
        <Settings modal={settingsModal} />
      </Modal>
    </div>
  );
}

export default Schedule;
