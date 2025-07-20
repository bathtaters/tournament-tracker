import { useState, useCallback } from "react";
import ScheduleHeader from "./components/ScheduleHeader";
import DaysContainer from "./components/DaysContainer";
import EditEvent from "../eventEditor/EditEvent";
import Settings from "../settings/Settings";
import { Modal, useModal } from "../common/Modal";

function Schedule() {
  // Local state
  const { backend, open, close, lock } = useModal();
  const settingsModal = useModal();
  const [isEditing, setEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const openEventModal = useCallback(
    (eventid) => {
      setCurrentEvent(eventid);
      open();
    },
    [open]
  );

  // Render
  return (
    <div>
      <ScheduleHeader
        isEditing={isEditing}
        setEdit={setEdit}
        openModal={openEventModal}
      />

      <DaysContainer isEditing={isEditing} openEventModal={openEventModal} />

      <Modal backend={backend}>
        <EditEvent eventid={currentEvent} closeModal={close} lockModal={lock} />
      </Modal>

      <Modal backend={settingsModal.backend}>
        <Settings close={settingsModal.close} lock={settingsModal.lock} />
      </Modal>
    </div>
  );
}

export default Schedule;
