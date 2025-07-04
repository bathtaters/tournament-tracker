import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventQuery, useSetEventMutation, useDeleteEventMutation } from "../eventEditor.fetch";

import { editorButtonLayout } from "../eventEditor.layout";
import { deleteEventAlert } from "../../../assets/alerts";
import { editEventLockCaptions } from "../../../assets/constants";
import { useLockScreen, useOpenAlert } from "../../common/common.hooks";


export default function useEditEventController(eventid, closeModal, hidePlayers, deleteRedirect) {
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

  // Create/Update event & close modal
  const submitHandler = useCallback(async (event) => {
    // Build event object
    if (!event.title.trim() && !playerList?.length) return closeModal(true)
    if (eventid) event.id = eventid
    if (!hidePlayers) event.players = playerList

    // Push event to server (Create/Update)
    return setEvent(event).then(() => closeModal(true))
  }, [setEvent, eventid, playerList, hidePlayers, closeModal])


  // Break early if no data/error
  if (isLoading || error || !closeModal) return { isLoading, error, notLoaded: true }

  // Delete handler (for editorButtons)
  const deleteHandler = () =>
    openAlert(deleteEventAlert(data?.title), 0)
      .then(res => {
        if (!res) return;
        if (eventid) deleteEvent(eventid)
        closeModal(true)
        navigate(deleteRedirect)
      })

  return {
    data, playerList, updatePlayerList, submitHandler,
    // Button layout
    buttons: editorButtonLayout(eventid, deleteHandler, closeModal),
  }
}