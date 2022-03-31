import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEventQuery, useSetEventMutation, useDeleteEventMutation } from "../eventEditor.fetch";

import { editorButtonLayout } from "../eventEditor.layout";
import { deleteEventAlert } from "../../../assets/alerts";
import { useOpenAlert } from "../../common/common.hooks";


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
  const deleteHandler = () =>
    openAlert(deleteEventAlert(data?.title), 0)
      .then(res => {
        if (!res) return;
        if (eventid) deleteEvent(eventid)
        modal.current.close(true)
        navigate("/home")
      })

  // Create/Update event & close modal
  async function submitHandler (event) {
    const savedPlayers = await playerList.current.getList()
    if (!savedPlayers) return;
    
    // Build event object
    if (!event.title.trim() && !savedPlayers.length) return modal.current.close(true)
    if (eventid) event.id = eventid
    event.players = savedPlayers

    // Push event to server (Create/Update)
    return setEvent(event).then(() => modal.current.close(true))
  }

  return {
    data, playerList, submitHandler,
    // Show lock screen
    isLoading: !eventid && isUpdating,
    // Button layout
    buttons: editorButtonLayout(eventid, deleteHandler, modal.current.close),
  }
}