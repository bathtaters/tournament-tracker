import { getDays, noDate, sortedEvents } from "./date.utils"
import { debugLogging } from "../../../assets/config"

// Convert Schedule output from server to array
export function scheduleAdapter({ schedule, settings }) {
  // Skip if no data
  if (!schedule || !settings) return debugLogging && console.log('SCHEDULE MISSING', {schedule, settings})
  
  // Get base data
  const emptyDay = [...Array(settings.dayslots).values()]
  const dateRange = getDays(settings.datestart, settings.dateend)

  let output = []
  dateRange.forEach((day) => {
    // Add entry for each day w/in range
    output.push({ day, events: sortedEvents(schedule[day]?.eventslots, emptyDay) })

    // Clear entry from schedule
    delete schedule[day]
  })

  // Append Unscheduled array
  output.push({ day: noDate, events: sortedEvents(schedule[noDate]?.eventslots) })
  delete schedule[noDate]
  
  // Add remaining events to Unscheduled
  Object.values(schedule).forEach(day => day.eventslots && output[output.length - 1].events.push(...Object.keys(day.eventslots)))

  debugLogging && console.log('SCHEDULE', output)
  return output
}


// Change Date of Event - Helper for eventUpdate
export function updateSchedule(schedule, id, { day, slot }) {
  if (!schedule) return
  
  // Remove old
  for (let i = 0; i < schedule.length; i++) {
    const idx = schedule[i].events.indexOf(id);
    if (idx === -1) continue;
    if (i === schedule.length - 1) schedule[i].events.splice(idx,1);
    else schedule[i].events[idx] = null;
    break;
  }
  
  // Add new
  if (!day) schedule[schedule.length - 1].events.push(id);
  else if (slot) schedule[schedule.findIndex(d => d.day === day)].events[slot - 1] = id;
  else schedule[schedule.findIndex(d => d.day === day)].events.push(id);
}
