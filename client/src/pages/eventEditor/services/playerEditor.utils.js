import { useRef, useEffect } from "react";
import { equalArrays } from "./eventEditor.services";

// Base for newPlayer
export const emptyNewPlayer = { visible: false, name: "", id: null };

// Filter player data for player editor
export const filterPlayer = ({ id, name }, includeId) => includeId ? { id, name } : { name };

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