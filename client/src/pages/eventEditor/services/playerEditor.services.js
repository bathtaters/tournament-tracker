import { useState, useImperativeHandle, useCallback, useRef } from "react";
import { usePlayerQuery, useSettingsQuery, useCreatePlayerMutation } from "../eventEditor.fetch";
import { useOpenAlert } from "../../common/common.hooks";

import playerListController, { retrieveList, usePropStateList } from "./playerList.services";
import { getRemaining, randomArray } from "./playerEditor.utils";


// PlayerEditor component logic
export default function usePlayerEditorController(players, status, onEdit, ref) {

  // Get Global State
  const { data, isLoading, error, isFetching } = usePlayerQuery();
  const { data: settings, isLoading: settLoad, error: settErr } = useSettingsQuery();
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  
  // Init Local State
  const suggestRef = useRef(null);
  const openAlert = useOpenAlert();
  const [ isChanged, setChanged ] = useState(!onEdit);
  const [ playerList, setPlayerList ] = usePropStateList(players);

  // Assign getList function to ref
  useImperativeHandle(ref, () => ({ getList: retrieveList(playerList, suggestRef, openAlert) }), [playerList, suggestRef.current, openAlert]);


  // Add/Remove player to/from list
  const { pushPlayer, popPlayer } = playerListController(data, playerList, setPlayerList, openAlert);
  
  // Run onEdit once, when first edit is made
  const onFirstEdit = useCallback(isChanged ? null : () => { onEdit(); setChanged(true); }, [isChanged, setChanged, onEdit]);


  // Break early while awaiting global data
  if (isLoading || settLoad || error || settErr || !data) return { isLoading: isLoading || settLoad, error: error || settErr }


  // If not started, get additional data for editing playerList
  const notStarted = status < 2
  const inputData = notStarted ? {
    // Data from parent
    data, pushPlayer, onFirstEdit, createPlayer,
    autofillSize: settings?.autofillsize,
    hideAutofill: Boolean(playerList.length),
    remainingPlayers: getRemaining(data, playerList),
    autofill: onFirstEdit,
  } : {}
  
  if (notStarted) {
    // Handle autofill click
    inputData.autofill = () => {
      setPlayerList(randomArray(inputData.remainingPlayers, inputData.autofillSize))
      onFirstEdit && onFirstEdit()
    }
  }
  

  // Pass to renderer
  return {
    data, playerList, inputData, suggestRef, popPlayer, notStarted,
    isFetching: playersUpdating || isFetching,
  }
}