// Import
import { useRef, useEffect } from "react";
import { defaultEventTitle, roundButtonText } from "../../../assets/strings";
import { equalArrays } from "../../../core/services/shared.services";

// Base settings
export const limits = {
  title: {min: 0, max: 50},
  wincount: {min: 1, max: 7},
  playerspermatch: {min: 2, max: 8},
  roundcount: {min: 1, max: 10},
  clocklimit: {min: 1, max: 24*60*60},
};
export const defaultValues = {
  title: defaultEventTitle, day: null,
  players: [], wincount: 2,
  playerspermatch: 2,
  roundcount: 3, clocklimit: 3600,
  lockat: 2
};

// For local render of playerList
export const emptyNewPlayer = { visible: false, name: "", id: null };


// Event status
// [0: N/A, 1: Pre-Event, 2: Active, 3: Complete]
export const getStatus = event => 
  !event ? 0 : !event.roundactive ? 1 : 
  event.roundactive > event.roundcount ? 3 : 2;

// Round Button label
// [0: N/A, 1: Start, 2: Not Reported, 3: Next, 4: End, 5: Complete]
export const getRoundButton = event => roundButtonText[
  !event ? 0 : event.roundactive === 0 ? 1 :
  event.roundactive > event.roundcount ? 5 :
  event.canadvance === false ? 2 :
  event.roundactive === event.roundcount ? 4 : 3
];


// Player records
export const statsOrder = ['matchScore','oppMatch','gameRate','oppGame'];
export const orderPlayers = statsData => (a,b) => {
  if (a === b) return 0;
  for (const brk of statsOrder) {
    if (statsData[a][brk] !== statsData[b][brk])
      return statsData[a][brk] - statsData[b][brk];
  }
  return a > b ? 1 : -1;
}


// Generate temp round
export const fakeRound = (eventData) => {
  const playerCount = 
    (eventData.players ? eventData.players.length : 0) -
    (eventData.drops ? eventData.drops.length : 0);
  let round = [], size = eventData.playerspermatch ? Math.ceil(playerCount/eventData.playerspermatch) : 0;
  for (let i=0; i<size; i++) {
    round.push('TBD-'+i);
  }
  return round;
};


// Cache swap

export function swapToDay(schedule, id, newDay) {
  // Remove old
  for (const day in schedule) {
    const idx = (schedule[day].events || []).indexOf(id);
    if (idx >= 0) { 
      schedule[day].events.splice(idx,1); break;
    }
  }
  // Add new
  if (!schedule[newDay]) schedule[newDay] = { events: [id] };
  else if (!schedule[newDay].events) schedule[newDay].events = [id];
  else schedule[newDay].events.push(id);
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