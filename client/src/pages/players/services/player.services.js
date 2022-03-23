import { deletePlayerMsg, cantDeletePlayerMsg } from "../../../assets/strings";

// Click on player name handler
export const playerClickController = (canDelete, deletePlayer, openAlert) => (playerid, e, playerData) => {
  if (!canDelete) return; // Pass click to default handler
  e.preventDefault();

  // Check player can be deleted
  if (playerData.eventids && playerData.eventids.length)
    return openAlert(cantDeletePlayerMsg(playerData.name));

  // Delete player
  openAlert(deletePlayerMsg(playerData.name), ["Delete","Cancel"])
    .then(r => r === 'Delete' && deletePlayer(playerid));
}

// Validate and add new player
export const createPlayerController = (playerData, createPlayer) => {
  if (playerData.name) createPlayer(playerData);
  return !!playerData.name;
};