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
export async function saveEvent(eventId, eventData, playerList, createEvent, updateEvent, modal) {
  const savedPlayers = await playerList.current.getList();
  if (!savedPlayers) return;
  
  // Build event object
  if (!eventData.title.trim() && !savedPlayers.length) return modal.current.close(true);
  if (eventId) eventData.id = eventId;
  eventData.players = savedPlayers;

  // Save event
  if (!eventData.id) createEvent(eventData);
  else updateEvent(eventData);
  modal.current.close(true);
}


// Apply only new changes to existing cache (For concurrent write-while-editing)
export function updateArrayWithChanges(before, after, arrToChange) {
  let result = [...arrToChange];
  before.forEach(v => { 
    if (!after.includes(v)) {
      const idx = result.indexOf(v);
      if (idx !== -1) result.splice(idx,1);
    } 
  });
  after.forEach((v,i) => { 
    if (!before.includes(v)) result.splice(i,0,v);
  });
  return result || [];
}


export const getButtonLayout = (id, data, deleteEvent, modal, navigate) => 
  editorButtonLayout(
    id,
    deleteController(id, data, deleteEvent, modal.current.close, navigate),
    modal.current.close
  );

export { equalArrays, nextTempId };