// Import
import { useRef, useEffect } from "react";
import { defaultDraftTitle } from "../assets/strings";
import { equalArrays } from "./misc";

// Base settings
export const limits = {
  title: {min: 0, max: 50},
  bestOf: {min: 1, max: 7},
  playersPerMatch: {min: 2, max: 8},
  roundCount: {min: 1, max: 10},
  clockLimit: {min: 1, max: 24*60*60},
};
export const defVal = {
  title: defaultDraftTitle, day: null,
  players: [], bestOf: 3,
  playersPerMatch: 2,
  roundCount: 3, clockLimit: 3600,
  lockAt: 2
};

// For local render of playerList
export const emptyNewPlayer = { visible: false, name: "", id: null };


// Draft status
// [0: N/A, 1: Pre-Draft, 2: Active, 3: Complete]
export const getStatus = draft => 
  !draft ? 0 : !draft.roundactive ? 1 : 
  draft.roundactive > draft.roundcount ? 3 : 2;



// Player records
export const breakersOrder = ['matchScore','oppMatch','gameRate','oppGame'];
export const orderPlayers = breakersData => (a,b) => {
  if (a === b) return 0;
  for (const brk of breakersOrder) {
    if (breakersData[a][brk] !== breakersData[b][brk])
      return breakersData[a][brk] - breakersData[b][brk];
  }
  return a > b ? 1 : -1;
}


// Generate temp round
export const fakeRound = (draftData) => {
  const playerCount = 
    (draftData.players ? draftData.players.length : 0) -
    (draftData.drops ? draftData.drops.length : 0);
  let round = [], size = draftData.playerspermatch ? Math.ceil(playerCount/draftData.playerspermatch) : 0;
  for (let i=0; i<size; i++) {
    round.push('TBD-'+i);
  }
  return round;
};


// Cache swap

export function swapToDay(schedule, id, newDay) {
  // Remove old
  for (const day in schedule) {
    const idx = schedule[day].indexOf(id);
    if (idx >= 0) { 
      schedule[day].splice(idx,1); break;
    }
  }
  // Add new
  if (!schedule[newDay]) schedule[newDay] = [id];
  else schedule[newDay].push(id);
}


// Save history of 1D array

export function usePreviousArray(newValue) {
  const prevRef = useRef([]);
  useEffect(() => { 
    if (newValue && !equalArrays(prevRef.current, newValue))
      prevRef.current = newValue;
  }, [newValue]);
  return prevRef.current || [];
}

// Apply only new changes to existing cache (For concurrent write-while-editing)

export function updateArrayWithChanges(before, after, arrToChange) {
  let result = [...arrToChange];
  before.forEach(v => { 
    if (!after.includes(v)) {
      const idx = result.indexOf(v);
      if (idx !== -1) result.splice(idx,1);
    } 
  });
  after.forEach((v,i) => { 
    if (!before.includes(v)) result.splice(i,0,v);
  });
  return result || [];
}