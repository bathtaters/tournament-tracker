import { useState } from "react";
import { suggestListLayout } from "../eventEditor.layout";
import { playerExists } from "./playerEditor.utils";
import { duplicatePlayerAlert, playerCreateError, createPlayerAlert } from "../../../assets/strings";
import { useOpenAlert } from "../../common/common.hooks";

// Add new player to DB
async function newPlayerController(playerData, players, createPlayer, pushPlayer, openAlert) {
  // Check for errors
  if (playerExists(playerData.name, players)) return openAlert(duplicatePlayerAlert(playerData.name));

  // Confirm create
  const answer = await openAlert(createPlayerAlert(playerData.name),0)
  console.log('CREATE',answer)
  if (!answer) return false;

  // Create & Push player
  console.log('CREATE PLAYER')
  const result = await createPlayer(playerData);
  console.log('RESULT',result)
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