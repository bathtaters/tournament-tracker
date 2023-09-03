import { useState, useRef } from "react";
import { usePlayerQuery, useSettingsQuery, useCreatePlayerMutation } from "../eventEditor.fetch";
import { useOpenAlert, useLockScreen } from "../../common/common.hooks";

import playerListController from "./playerList.services";
import { getRemaining, randomArray } from "./playerEditor.utils";
import { playerLockCaption } from "../../../assets/constants";


export default function usePlayerEditorController(value, onChange, isStarted, onFirstChange) {

  // Get Global State
  const { data, isLoading, error, isFetching } = usePlayerQuery();
  const { data: settings, isLoading: settLoad, error: settErr } = useSettingsQuery();
  const [ createPlayer, { isLoading: isAddingPlayer } ] = useCreatePlayerMutation();
  useLockScreen(isAddingPlayer, playerLockCaption);
  
  // Init Local State
  const suggestRef = useRef(null);
  const openAlert = useOpenAlert();
  const [ isChanged, setChanged ] = useState(!onFirstChange);

  // Add/Remove player to/from list
  const { pushPlayer, popPlayer } = playerListController(data, value, onChange, openAlert);
  
  // Run onFirstChange once, when first edit is made
  const onFirstEdit = isChanged ? null : () => { onFirstChange(); setChanged(true); };


  // Break early while awaiting global data
  if (isLoading || settLoad || error || settErr || !data) return { isLoading: isLoading || settLoad, error: error || settErr }


  // If not started, get additional data for editing value
  const inputData = isStarted ? {} : {
    // Data from parent
    data, pushPlayer, onFirstEdit, createPlayer,
    autofillSize: settings?.autofillsize,
    hideAutofill: Boolean(value?.length),
    remainingPlayers: getRemaining(data, value),
    autofill: onFirstEdit,
  }
  
  if (!isStarted) {
    // Handle autofill click
    inputData.autofill = () => {
      onChange(randomArray(inputData.remainingPlayers, inputData.autofillSize))
      onFirstEdit && onFirstEdit()
    }
  }
  

  // Pass to renderer
  return {
    data, inputData, suggestRef, popPlayer,
    isUpdating: isAddingPlayer || isFetching,
  }
}