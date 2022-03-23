import { equalArrays } from "../../common/services/basic.services";
import { usePropState } from "../../common/common.hooks";
import { duplicatePlayerMsg, unsavedPlayerMsg } from "../../../assets/strings";

export const usePropStateList = (propList) => usePropState(propList || [], equalArrays)

// Add player to list
const pushPlayerController = (playerData, players, setPlayers, openAlert) => async function pushPlayer(playerId) {
  if (!playerId) throw new Error("Add player is missing playerid!");

  let res = true;
  if (players.includes(playerId)) {
    await openAlert(duplicatePlayerMsg(playerData[playerId]?.name));
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
  const textbox = suggestRef.current.getValue();
  if ((textbox?.value || '').trim()) {

    // Ask user
    const answer = await openAlert(unsavedPlayerMsg(textbox.value), ["Add","Ignore","Cancel"])
    if (answer === 'Ignore') return savedPlayers; // continue w/o adding
    if (answer !== 'Add') return; // user cancel
    
    // Add player to list
    const newPlayer = await suggestRef.current.submit();

    // Get player ID to include in savedPlayers
    const newId = newPlayer?.id || newPlayer?.result;
    if (!newId) return; // failed to add player
    savedPlayers.push(newId); // add new player
  }
  
  return savedPlayers;
};