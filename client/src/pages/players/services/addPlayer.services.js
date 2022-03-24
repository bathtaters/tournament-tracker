import { usePlayerQuery, useCreatePlayerMutation } from "../player.fetch";
import { useOpenAlert } from "../../common/common.hooks";
import { emptyNameMsg, duplicateNameMsg } from "../../../assets/strings";

export default function useCreatePlayer(modal) {
  // Load in global data
  const { data, isLoading, error } = usePlayerQuery()
  const [ createPlayerFetch ] = useCreatePlayerMutation()
  const openAlert = useOpenAlert()

  // Create list of names (to check for duplicates)
  const playerNames = Object.values(data || {}).map(({name}) => (name || '').toLowerCase())

  // Create player action
  const createPlayer = (playerData) => {
    // Do nothing if empty
    if (!playerData?.name) return openAlert(emptyNameMsg)

    // Check if player name exists
    if (playerNames.includes(playerData.name.toLowerCase()))
      return openAlert(duplicateNameMsg(playerData.name))

    // Add player & close modal
    createPlayerFetch(playerData)
    modal.current.close(true)
  }

  // Catch errors
  if (error) throw new Error(error)
  if (isLoading) return () => openAlert('Player data not loaded. Try again in a minute.')

  return createPlayer
}