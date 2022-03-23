import { useState } from "react";
import { suggestListLayout } from "../eventEditor.layout";
import { playerExists } from "./playerEditor.utils";
import { createPlayerMsg, playerCreateError, duplicatePlayerMsg } from "../../../assets/strings";


// Add new player to DB
async function newPlayerController(playerData, players, createPlayer, pushPlayer) {
  // Check for errors/confirm
  if (playerExists(playerData.name, players)) return window.alert(duplicatePlayerMsg(playerData.name));
  if (!window.confirm(createPlayerMsg(playerData.name))) return false;

  // Create & Push player
  const res = await createPlayer(playerData);
  if (res?.error || !res?.data?.id) throw playerCreateError(res, playerData);
  return pushPlayer(res.data.id) && res.data.id;
}


// Click add button
const onSubmitController = (hideSuggest, setHide, handleNewPlayer, pushPlayer, onEdit) =>
  function submitHandler(entry, text) {
    // Show/Hide field
    if (hideSuggest) return setHide(false);
    if (!entry) return setHide(!hideSuggest);

    // Call onEdit
    if (onEdit && !entry.isStatic) onEdit();

    // Add Player
    if (entry.id) return pushPlayer(entry.id);
    if (!entry.isStatic) console.warn('Missing player created automatically', entry);
    return handleNewPlayer(text);
  }


// PlayerInput component logic
export default function usePlayerInputController({ data, remainingPlayers, onFirstEdit, pushPlayer, createPlayer }, ref) {

  const [isHidden, setHide] = useState(true)

  // New player handler (For clicking 'add player')
  const handleNewPlayer = (name) => newPlayerController({ name }, data, createPlayer, pushPlayer)

  return {
    // Local state
    isHidden,

    // Build list
    suggestions: suggestListLayout(remainingPlayers, data),

    // OnSubmit handler
    submitHandler: onSubmitController(isHidden, setHide, handleNewPlayer, pushPlayer, onFirstEdit),

    // Add Button handler
    addButtonHandler: () => {
      onFirstEdit && onFirstEdit();
      return isHidden ? setHide(false) : ref.current.submit();
    },
  }
}