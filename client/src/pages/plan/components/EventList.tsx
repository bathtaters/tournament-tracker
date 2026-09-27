import type { EventData } from "types/models";
import { Modal } from "../../../common/Modal/Modal";
import EditableList from "../../../common/EditableList/EditableList";
import EditEvent from "../../eventEditor/EditEvent";
import useEventList from "../services/eventList.controller";

type EventListProps = {
  value: EventData["id"][];
  onChange: (ids: EventData["id"][]) => void;
};

function EventList({ value, onChange }: EventListProps) {
  const { editId, listProps, backend, lock, close } = useEventList(
    value,
    onChange,
  );

  return (
    <>
      <EditableList type="Event" {...listProps} />

      <Modal backend={backend}>
        <EditEvent
          lockModal={lock}
          closeModal={close}
          eventid={editId}
          hidePlayers={true}
          onDeleteRedirect="/plan"
        />
      </Modal>
    </>
  );
}

export default EventList;
