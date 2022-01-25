// Import
import { useRef, useEffect } from "react";
import { defaultDraftTitle, roundButtonText } from "../assets/strings";
import { equalArrays } from "./misc";

// Base settings
export const limits = {
  title: {min: 0, max: 50},
  wincount: {min: 1, max: 7},
  playerspermatch: {min: 2, max: 8},
  roundcount: {min: 1, max: 10},
  clocklimit: {min: 1, max: 24*60*60},
};
export const defaultValues = {
  title: defaultDraftTitle, day: null,
  players: [], wincount: 2,
  playerspermatch: 2,
  roundcount: 3, clocklimit: 3600,
  lockat: 2
};

// For local render of playerList
export const emptyNewPlayer = { visible: false, name: "", id: null };


// Draft status
// [0: N/A, 1: Pre-Draft, 2: Active, 3: Complete]
export const getStatus = draft => 
  !draft ? 0 : !draft.roundactive ? 1 : 
  draft.roundactive > draft.roundcount ? 3 : 2;

// Round Button label
// [0: N/A, 1: Start, 2: Not Reported, 3: Next, 4: End, 5: Complete]
export const getRoundButton = draft => roundButtonText[
  !draft ? 0 : draft.roundactive === 0 ? 1 :
  draft.roundactive > draft.roundcount ? 5 :
  draft.canadvance === false ? 2 :
  draft.roundactive === draft.roundcount ? 4 : 3
];


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
    const idx = (schedule[day].drafts || []).indexOf(id);
    if (idx >= 0) { 
      schedule[day].drafts.splice(idx,1); break;
    }
  }
  // Add new
  if (!schedule[newDay]) schedule[newDay] = { drafts: [id] };
  else if (!schedule[newDay].drafts) schedule[newDay].drafts = [id];
  else schedule[newDay].drafts.push(id);
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