import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEventQuery, useSetEventMutation, useDeleteEventMutation } from "../eventEditor.fetch";

import { editorButtonLayout } from "../eventEditor.layout";
import { deleteEventAlert } from "../../../assets/strings";
import { useOpenAlert } from "../../common/common.hooks";

// Delete button controller
const deleteController = (id, data, deleteEvent, openAlert, closeModal, navigate) => () => 
  openAlert(deleteEventAlert(data?.title), 0).then(res => {
    if (!res) return;
    if (id) deleteEvent(id);
    closeModal(true);
    navigate("/home");
  });


// Create/Update event & close modal
async function saveEvent(eventId, eventData, playerList, setEvent, modal) {
  const savedPlayers = await playerList.current.getList();
  if (!savedPlayers) return;
  
  // Build event object
  if (!eventData.title.trim() && !savedPlayers.length) return modal.current.close(true);
  if (eventId) eventData.id = eventId;
  eventData.players = savedPlayers;

  // Push event to server (Create/Update)
  setEvent(eventData).then(() => modal.current.close(true));
}


// EditEvent main logic
export default function useEditEventController(eventid, modal) {
  // Get server data
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid })

  // Init server fetches
  const [ setEvent, { isLoading: isUpdating } ] = useSetEventMutation()
  const [ deleteEvent ] = useDeleteEventMutation()
  
  // Init hooks
  const playerList = useRef(null)
  let navigate = useNavigate()
  const openAlert = useOpenAlert()

  // Break early if no data/error
  if (isLoading || error || !modal) return { isLoading, error, notLoaded: true }

  // Delete handler (for editorButtons)
  const deleteHandler = deleteController(eventid, data, deleteEvent, openAlert, modal.current.close, navigate)

  return {
    data, playerList, isUpdating,
    // Button layout
    buttons: editorButtonLayout(eventid, deleteHandler, modal.current.close),
    // Handler
    submitHandler: (event) => saveEvent(eventid, event, playerList, setEvent, modal), 
  }
}