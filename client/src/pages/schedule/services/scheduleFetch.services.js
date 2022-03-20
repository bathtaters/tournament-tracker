import { getDays, noDate, sortedEvents } from "./date.utils"

// Convert Schedule output from server to array
export function scheduleAdapter({ schedule, settings }) {
  // Skip if no data
  if (!schedule || !settings) return console.log('SCHEDULE MISSING', {schedule, settings})
  
  // Get base data
  const emptyDay = [...Array(settings.dayslots).values()]
  const dateRange = getDays(settings.datestart, settings.dateend)

  // Setup Unscheduled array
  let output = [{ day: noDate, events: sortedEvents(schedule[noDate]?.eventslots) }]
  delete schedule[noDate]

  dateRange.forEach((day) => {
    // Add entry for each day w/in range
    output.push({ day, events: sortedEvents(schedule[day]?.eventslots, emptyDay) })

    // Clear entry from schedule
    delete schedule[day]
  })
  
  // Add remaining events to Unscheduled
  Object.values(schedule).forEach(day => day.eventslots && output[0].events.push(...Object.keys(day.eventslots)))

  console.log('SCHEDULE', output)
  return output
}


// Change Date of Event - Helper for eventUpdate
export function updateSchedule(schedule, id, { day, slot }) {
  if (!schedule) return
  
  // Remove old
  for (let i = 0; i < schedule.length; i++) {
    const idx = schedule[i].events.indexOf(id);
    if (idx === -1) continue;
    if (!i) schedule[i].events.splice(idx,1);
    else schedule[i].events[idx] = null;
    break;
  }
  
  // Add new
  const addIdx = !day ? -1 : schedule.findIndex(d => d.day === day);
  if (addIdx < 0) schedule[0].events.push(id);
  else if (slot) schedule[addIdx].events[slot - 1] = id;
  else schedule[addIdx].events.push(id);
}
