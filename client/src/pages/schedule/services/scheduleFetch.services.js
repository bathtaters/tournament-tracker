import { getDays, noDate } from "./date.services"

// Convert Schedule output from server to array
export function scheduleAdapter({ schedule, settings }) {
  // Skip if no data
  if (!schedule || !settings) return console.log('SCHEDULE', {schedule, settings})
  
  // Get base data
  const emptyDay = [...Array(settings.dayslots).values()]
  const dateRange = getDays(settings.datestart, settings.dateend)

  // Setup Unscheduled array
  let output = [{ day: noDate, events: Object.keys(schedule[noDate]?.eventslots || {}) }]

  dateRange.forEach((day) => {
    if (day === noDate) return // Skip Unscheduled

    // Add events outside range to Unscheduled
    if (!dateRange.includes(day))
      return output[0].events.push(...Object.keys(schedule[day].eventslots))

    // Setup day object base
    const entry = { day, events: [...emptyDay] }
    if (!schedule[day]?.eventslots) return output.push(entry) // Skip missing days
    
    for (const [event,slot] of Object.entries(schedule[day].eventslots)) {
      // Add to scheduled slot
      if (slot && !entry.events[slot - 1]) entry.events[slot - 1] = event
      // Add unslotted to Unscheduled
      else output[0].events.push(event)
    }
    
    output.push(entry)
  })

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
  if (addIdx < 0 || !slot) schedule[0].events.push(id);
  else schedule[addIdx].events[slot - 1] = id;
}
