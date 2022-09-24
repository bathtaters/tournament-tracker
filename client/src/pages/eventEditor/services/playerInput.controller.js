import { useState } from "react";
import { suggestListLayout } from "../eventEditor.layout";
import { playerExists } from "./playerEditor.utils";
import { duplicatePlayerAlert, createPlayerAlert, playerCreateError } from "../../../assets/alerts";
import { useOpenAlert } from "../../common/common.hooks";


export default function usePlayerInputController({ data, remainingPlayers, onFirstEdit, pushPlayer, createPlayer }, ref) {
  // Setup state
  const openAlert = useOpenAlert()
  const [isHidden, setHide] = useState(true)

  // Add new player to DB
  async function handleNewPlayer(name) {
    // Check for errors
    if (!name.trim()) return; // Blank name
    if (playerExists(name, data)) return openAlert(duplicatePlayerAlert(name))

    // Confirm create
    const answer = await openAlert(createPlayerAlert(name),0)
    if (!answer) return false

    // Create & Push player
    const playerData = { name }
    const result = await createPlayer(playerData)
    if (result?.error || !result?.data?.id) throw playerCreateError(result, playerData)
    return pushPlayer(result.data.id) && result.data.id
  }

  // Click add button
  function submitHandler(text, entry) {
    // Show/Hide field
    if (isHidden) return setHide(false)
    if (!entry) return setHide(!isHidden)

    // Call onFirstEdit
    if (onFirstEdit && !entry.isStatic) onFirstEdit()

    // Add Player
    if (entry.id) return pushPlayer(entry.id)
    if (!entry.isStatic) console.warn('Missing player created automatically', entry)
    return handleNewPlayer(text)
  }

  return {
    isHidden, submitHandler,

    // Build list
    suggestions: suggestListLayout(remainingPlayers, data),

    // Add Button handler
    addButtonHandler: () => {
      onFirstEdit && onFirstEdit();
      return isHidden ? setHide(false) : ref.current.submit();
    },
  }
}