import { getName } from "./playerEditor.utils";
import { equalArrays } from "../../common/services/basic.services";
import { usePropState } from "../../common/common.hooks";
import { duplicatePlayerAlert, unsavedPlayerAlert } from "../../../assets/alerts";

export const usePropStateList = (propList) => usePropState(propList || [], equalArrays)

// Add player to list
const pushPlayerController = (playerData, players, setPlayers, openAlert) => async function pushPlayer(playerId) {
  if (!playerId) throw new Error("Add player is missing playerid!");

  let res = true;
  if (players.includes(playerId)) {
    await openAlert(duplicatePlayerAlert(playerData[playerId]?.name));
    res = false;
  } else setPlayers(players.concat(playerId));

  return res;
};

// Remove player from list
const popPlayerController = (players, setPlayers) => (pid, idx) => function popPlayer() {
  const newList = players.slice();
  const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
  if (rmvIdx in newList) newList.splice(rmvIdx,1);
  setPlayers(newList);
};

// Combined
export default function playerListController (playerData, players, setPlayers, openAlert) {
  return {
    pushPlayer: pushPlayerController(playerData, players, setPlayers, openAlert),
    popPlayer: popPlayerController(players, setPlayers),
  };
}


// Get player list (Run via ref)
export const retrieveList = (playerList, suggestRef, openAlert) => async () => {
  let savedPlayers = playerList.slice();
  if (!suggestRef?.current) return savedPlayers;

  // Handle leftover text in player box
  const unaddedName = getName(suggestRef.current.getValue());
  if ((unaddedName || '').trim()) {

    // Ask user
    const alert = unsavedPlayerAlert(unaddedName)
    const answer = await openAlert(alert)
    if (answer === alert.buttons[1].value ?? alert.buttons[1]) return savedPlayers; // continue w/o adding
    if (answer !== alert.buttons[0].value ?? alert.buttons[0]) return; // user cancel
    
    // Add player to list
    const newPlayer = await suggestRef.current.submit();

    // Get player ID to include in savedPlayers
    const newId = newPlayer?.id || newPlayer?.result;
    if (!newId) return; // failed to add player
    savedPlayers.push(newId); // add new player
  }
  
  return savedPlayers;
};