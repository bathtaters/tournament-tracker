import { useState } from "react";
import { suggestListLayout } from "../eventEditor.layout";
import { playerExists } from "./playerEditor.utils";
import { createPlayerMsg, playerCreateError, duplicatePlayerMsg } from "../../../assets/strings";
import { useOpenAlert } from "../../common/common.hooks";

// Add new player to DB
async function newPlayerController(playerData, players, createPlayer, pushPlayer, openAlert) {
  // Check for errors/confirm
  if (playerExists(playerData.name, players)) return openAlert(duplicatePlayerMsg(playerData.name));
  const answer = await openAlert(createPlayerMsg(playerData.name), ["Create","Cancel"])
  if (answer !== 'Create') return false;

  // Create & Push player
  const result = await createPlayer(playerData);
  if (result?.error || !result?.data?.id) throw playerCreateError(result, playerData);
  return pushPlayer(result.data.id) && result.data.id;
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
  const openAlert = useOpenAlert()

  const [isHidden, setHide] = useState(true)

  // New player handler (For clicking 'add player')
  const handleNewPlayer = (name) => newPlayerController({ name }, data, createPlayer, pushPlayer, openAlert)

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