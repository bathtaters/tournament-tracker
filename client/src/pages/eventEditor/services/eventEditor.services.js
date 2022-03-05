import { equalArrays, nextTempId } from "../../common/services/basic.services";
import { editorButtonLayout } from "../eventEditor.layout";
import { deleteEventMsg } from "../../../assets/strings";

// Delete button controller
const deleteController = (id, data, deleteEvent, closeModal, navigate) => () => {
  if (!window.confirm(deleteEventMsg(data && data.title))) return;
  if (id) deleteEvent(id);
  closeModal(true);
  navigate("/home");
};


// Create/Update event & close modal
export async function saveEvent(eventId, eventData, playerList, setEvent, modal) {
  const savedPlayers = await playerList.current.getList();
  if (!savedPlayers) return;
  
  // Build event object
  if (!eventData.title.trim() && !savedPlayers.length) return modal.current.close(true);
  if (eventId) eventData.id = eventId;
  eventData.players = savedPlayers;

  // Push event to server (Create/Update)
  setEvent(eventData);
  modal.current.close(true);
}


export const getButtonLayout = (id, data, deleteEvent, modal, navigate) => 
  editorButtonLayout(
    id,
    deleteController(id, data, deleteEvent, modal.current.close, navigate),
    modal.current.close
  );

export { equalArrays, nextTempId };