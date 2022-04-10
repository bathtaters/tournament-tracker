import { useState, useRef, useCallback } from "react";
import { useOpenAlert } from "../../common/common.hooks";
import { useSettingsQuery, useDeletePlayerMutation } from "../player.fetch";
import { deletePlayerAlert, cantDeletePlayerAlert } from "../../../assets/alerts";

// Validate and add new player
export const createPlayerController = (playerData, createPlayer) => {
  if (!playerData.name) return;
  // Check if player name exists
  createPlayer(playerData)
  return true;
};


// Click on player name handler
const playerClickController = (deleteMode, deletePlayer, openAlert) => (playerid, e, { players, stats }) => {
  if (!deleteMode) return; // Pass click to default handler
  e.preventDefault()

  // Get data
  const name = players[playerid]?.name, hasEvents = stats[playerid]?.eventids?.length;

  // Check player can be deleted
  if (hasEvents) return openAlert(cantDeletePlayerAlert(name))

  // Delete player
  openAlert(deletePlayerAlert(name), 0).then(r => r && deletePlayer(playerid))
}

// Players base logic
export default function usePlayersController() {
  // Init globals
  const { data: settings } = useSettingsQuery()
  const [ deletePlayer ] = useDeletePlayerMutation()
  const advanceMode = settings?.showadvanced
  
  // Setup locals
  const modal = useRef(null)
  const openAlert = useOpenAlert()
  const [deleteMode, setDeleteMode] = useState(false)
  
  // Actions
  const toggleDelete = () => setDeleteMode(!deleteMode)

  const handlePlayerClick = useCallback(
    playerClickController(deleteMode, deletePlayer, openAlert), [deleteMode, deletePlayer, openAlert]
  )

  return { deleteMode, advanceMode, modal, handlePlayerClick, toggleDelete }
}