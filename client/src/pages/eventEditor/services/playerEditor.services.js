import { useRef, useEffect } from "react";
import { equalArrays, updateArrayWithChanges } from "./eventEditor.services";

import { 
  createPlayerMsg,
  duplicatePlayerMsg,
  unsavedPlayerMsg,
  unaddedPlayerMsg,
  playerCreateError,
} from "../../../assets/strings";

// For local render of playerList
export const emptyNewPlayer = { visible: false, name: "", id: null };


// ---------- Basic Actions ---------- \\

// Add player to list
export const pushPlayerController = (playerData, players, setPlayers, setPlayer) => playerId => {
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
export const popPlayerController = (players, setPlayers) => (pid, idx) => () => {
  const newList = players.slice();
  const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
  if (rmvIdx in newList) newList.splice(rmvIdx,1);
  setPlayers(newList);
};


// ---------- User Actions ---------- \\

// Click add button
export const clickAddController = (currPlayer, setPlayer, pushPlayer, handleFirstEdit) => (_, override) => {
  if (!currPlayer.visible) return setPlayer({ ...currPlayer, visible: true });

  let playerData = override || {...currPlayer};
  playerData.name = playerData.name.trim();
  if (!playerData.name) return setPlayer(emptyNewPlayer);

  if (handleFirstEdit) handleFirstEdit();
  return pushPlayer(playerData.id);
}

// Click autofill cuttom
export const autofillController = (players, setPlayers, size) => () => setPlayers(randomArray(players, size));

// Add new player to DB
export async function newPlayerController(playerData, createPlayer, addPlayer) {
  if (!window.confirm(createPlayerMsg(playerData.name))) return true;
  const id = await createPlayer(playerData).then(r => r.data.id);
  if (!id) throw playerCreateError(playerData);
  return addPlayer(id);
}


// ---------- Automated Actions ---------- \\

// Update from SuggestText
export const newPlayerChange = (newPlayer, setNewPlayer) => (e) => e.target.value !== undefined ? 
  setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
  setNewPlayer({ ...newPlayer, id: e.target.id });

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


// ---------- HELPERS ---------- \\

// Radomizes an array, optionally trimming it to a specific size
const randomArray = (arr, size) => {
  if (typeof size !== 'number' || size > arr.length) size = arr.length;
  let res = [], rem = arr.slice();
  for (let i = 0; i < size; i++) {
    res.push(rem.splice(Math.floor(Math.random()*rem.length), 1)[0]);
  }
  return res;
};

// Get list of players who are not already selected
export const getRemaining = (players, playerList) => players ? Object.keys(players)
  .filter(p => !players[p].isteam && !playerList.includes(p)) : [];

// Save history of 1D array
export function usePreviousArray(newValue) {
  const prevRef = useRef([]);
  useEffect(() => { 
    if (newValue && !equalArrays(prevRef.current, newValue))
      prevRef.current = newValue;
  }, [newValue]);
  return prevRef.current || [];
}