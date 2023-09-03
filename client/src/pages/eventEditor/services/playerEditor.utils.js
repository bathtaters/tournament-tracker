import { eventEditor } from "../../../assets/config";

// Check if player already exists in list
export const playerExists = (player, allPlayers) => {
  const lower = player.toLowerCase();
  return Object.values(allPlayers).some(p =>
    (eventEditor.checkTeamsForDupe || !p.isteam) && p.name.toLowerCase() === lower
  );
}


// Radomizes an array, optionally trimming it to a specific size
export const randomArray = (arr, size) => {
  if (typeof size !== 'number' || size > arr.length) size = arr.length;
  let res = [], rem = arr.slice();
  for (let i = 0; i < size; i++) {
    res.push(rem.splice(Math.floor(Math.random()*rem.length), 1)[0]);
  }
  return res;
};


// Get list of players who are not already selected
export const getRemaining = (players, playerList) => players ? Object.keys(players)
  .filter(p => !players[p].isteam && !playerList?.includes(p)) : [];


// Get name of player from getValue result
export const getName = (value) => value?.isStatic ? value.text : value?.value