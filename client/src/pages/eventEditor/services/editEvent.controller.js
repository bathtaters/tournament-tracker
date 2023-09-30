import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventQuery, useSetEventMutation, useDeleteEventMutation } from "../eventEditor.fetch";

import { editorButtonLayout } from "../eventEditor.layout";
import { deleteEventAlert } from "../../../assets/alerts";
import { editEventLockCaptions } from "../../../assets/constants";
import { useLockScreen, useOpenAlert } from "../../common/common.hooks";


export default function useEditEventController(eventid, modal, hidePlayers, deleteRedirect) {
  // Get server data
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid })

  // Init server fetches
  const [ deleteEvent ] = useDeleteEventMutation()
  const [ setEvent, { isLoading: isUpdating } ] = useSetEventMutation()
  useLockScreen(isUpdating, editEventLockCaptions[+Boolean(eventid)])
  
  // Init hooks
  const [ playerList, updatePlayerList ] = useState(data?.players || [])
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
        navigate(deleteRedirect)
      })

  // Create/Update event & close modal
  async function submitHandler (event) {    
    // Build event object
    if (!event.title.trim() && !playerList?.length) return modal.current.close(true)
    if (eventid) event.id = eventid
    if (!hidePlayers) event.players = playerList

    // Push event to server (Create/Update)
    return setEvent(event).then(() => modal.current.close(true))
  }

  return {
    data, playerList, updatePlayerList, submitHandler,
    // Button layout
    buttons: editorButtonLayout(eventid, deleteHandler, modal.current.close),
  }
}