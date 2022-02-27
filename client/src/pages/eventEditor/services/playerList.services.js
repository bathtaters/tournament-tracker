import { equalArrays, updateArrayWithChanges } from "./eventEditor.services";
import { duplicatePlayerMsg, unsavedPlayerMsg } from "../../../assets/strings";


// Add player to list
const pushPlayerController = (playerData, players, setPlayers) => function pushPlayer(playerId) {
  if (!playerId) throw new Error("Add player is missing playerid!");

  let res = true;
  if (players.includes(playerId)) {
    window.alert(duplicatePlayerMsg(playerData[playerId] && playerData[playerId].name));
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
export default function playerListController (playerData, players, setPlayers) {
  return {
    pushPlayer: pushPlayerController(playerData, players, setPlayers),
    popPlayer: popPlayerController(players, setPlayers),
  };
}


// Push global updates to state
export const updateState = (prevState, currState, setCurrState) => {
  if (!equalArrays(prevState, currState))
    setCurrState(s => updateArrayWithChanges(prevState, currState || [], s));
};


// Get player list (Run via ref)
export const retrieveList = (playerList, suggestRef) => async () => {
  let savedPlayers = playerList.slice();
  if (!suggestRef?.current) return savedPlayers;

  // Handle leftover text in player box
  const textbox = suggestRef.current.getValue();
  if ((textbox?.value || '').trim()) {

    // Add player to list
    if (!window.confirm(unsavedPlayerMsg(textbox.value))) return; // user cancel
    const newPlayer = suggestRef.current.submit();

    // Get player ID to include in savedPlayers
    const newId = newPlayer && (newPlayer.id || await newPlayer.result);
    if (!newId) return; // failed to add player
    savedPlayers.push(newId); // add new player
  }
  
  return savedPlayers;
};