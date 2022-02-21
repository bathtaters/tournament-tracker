import { equalArrays, updateArrayWithChanges } from "./eventEditor.services";
import { emptyNewPlayer } from "./playerEditor.utils";
import { duplicatePlayerMsg, unsavedPlayerMsg, unaddedPlayerMsg } from "../../../assets/strings";


// Add player to list
const pushPlayerController = (playerData, players, setPlayers, setPlayer) => function pushPlayer(playerId) {
  if (!playerId) throw new Error("Add player is missing playerid!");

  let res = true;
  if (players.includes(playerId)) {
    window.alert(duplicatePlayerMsg(playerData[playerId] && playerData[playerId].name));
    res = false;
  } else setPlayers(players.concat(playerId));

  setPlayer(emptyNewPlayer);
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
export default function playerListController (playerData, players, setPlayers, setPlayer) {
  return {
    pushPlayer: pushPlayerController(playerData, players, setPlayers, setPlayer),
    popPlayer: popPlayerController(players, setPlayers),
  };
}



// Push global updates to state
export const updateState = (prevState, currState, setCurrState) => {
  if (!equalArrays(prevState, currState))
    setCurrState(s => updateArrayWithChanges(prevState, currState || [], s));
};

// Get list for parent components
export const retrieveList = (playerList, newPlayer, pushPlayer, setNewPlayer) => () => {
  let savedPlayers = playerList.slice();

  // Handle leftover text in player box
  if (newPlayer.visible && newPlayer.name.trim()) {
    if (newPlayer.id) {
      // Add player if they exist
      if (window.confirm(unsavedPlayerMsg(newPlayer.name)) && pushPlayer(newPlayer.id))
        savedPlayers.push(newPlayer.id);
      else return setNewPlayer(emptyNewPlayer);
      // Exit if player does not exist
    } else if (!window.confirm(unaddedPlayerMsg(newPlayer.name))) return; // Abort
  }
  
  setNewPlayer(emptyNewPlayer)
  return savedPlayers;
};