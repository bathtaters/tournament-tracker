import { useState, useRef, useCallback } from "react";
import { useOpenAlert } from "../../common/common.hooks";
import { useAccessLevel, useSettingsQuery } from "../../common/common.fetch";
import { useDeletePlayerMutation } from "../player.fetch";
import { deletePlayerAlert, cantDeletePlayerAlert } from "../../../assets/alerts";

// Validate and add new player
export const createPlayerController = (playerData, createPlayer) => {
  if (!playerData.name) return;
  // Check if player name exists
  createPlayer(playerData)
  return true;
};


// Click on player name handler
const usePlayerClickController = (deleteMode, deletePlayer, openAlert) => 
  useCallback((playerid, e, { players, stats }) => {
    if (!deleteMode) return; // Pass click to default handler
    e.preventDefault()

    // Get data
    const name = players[playerid]?.name, hasEvents = stats[playerid]?.eventids?.length;

    // Check player can be deleted
    if (hasEvents) return openAlert(cantDeletePlayerAlert(name))

    // Delete player
    openAlert(deletePlayerAlert(name), 0).then(r => r && deletePlayer(playerid))
  }, [deleteMode, deletePlayer, openAlert]);

  
// Players base logic
export default function usePlayersController() {
  // Init globals
  const { access } = useAccessLevel()
  const [ deletePlayer ] = useDeletePlayerMutation()
  const { data: settings } = useSettingsQuery()
  
  // Setup locals
  const modal = useRef(null)
  const openAlert = useOpenAlert()
  const [deleteMode, setDeleteMode] = useState(false)
  const hideStats = !settings?.showstandings
  
  // Actions
  const toggleDelete = () => setDeleteMode(!deleteMode)

  const handlePlayerClick = usePlayerClickController(deleteMode, deletePlayer, openAlert)

  return { deleteMode, access, modal, handlePlayerClick, toggleDelete, hideStats }
}