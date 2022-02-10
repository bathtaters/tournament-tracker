import { equalArrays, nextTempId } from "../../common/services/basic.services";

// Create/Update event, return TRUE to close window (FALSE to keep window open)
export function saveEvent(eventId, eventData, savedPlayers, createEvent, updateEvent) {
  if (!savedPlayers) return false;
  
  // Build event object
  if (!eventData.title.trim() && !savedPlayers.length) return true;
  if (eventId) eventData.id = eventId;
  eventData.players = savedPlayers;

  // Save event
  if (!eventData.id) createEvent(eventData);
  else updateEvent(eventData);
  return true;
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

export { equalArrays, nextTempId };