import { getDays, noDate, sortedEvents } from "./date.utils"
import { debugLogging } from "../../../assets/config"

// Convert Schedule output from server to array
export function scheduleAdapter({ schedule, settings }, _, isPlan) {
  // Skip if no data
  if (!schedule || !settings) return debugLogging && console.log('SCHEDULE MISSING', {schedule, settings})
  
  // Get base data
  const emptyDay = Array((isPlan ? settings.planslots : null) ?? settings.dayslots).fill(undefined)
  const dateRange = getDays(
    (isPlan ? settings.plandates?.[0] : null) ?? settings.datestart,
    (isPlan ? settings.plandates?.[1] : null) ?? settings.dateend,
  )

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
export function updateSchedule(schedule, id, update) {
  if (!schedule) return
  const result = [], noDateIdx = schedule.length - 1

  // Remove from Schedule
  for (let idx = 0; idx <= noDateIdx; idx++) {
    // No info
    result.push(!schedule[idx]?.events ? schedule[idx]
      // Unscheduled event -- pop from array
      : idx === noDateIdx ? {
        ...schedule[idx],
        events: schedule[idx].events
          .filter((eId) => eId === id)
      // Scheduled event -- replace w/ empty value
      } : {
        ...schedule[idx],
        events: schedule[idx].events
          .map((eId) => eId === id ? undefined : eId)
      }
    )
  }
  if (!update) return result

  
  // Add to schedule
  const updateDay = typeof update.day === 'string' ? update.day.slice(0,10) : null
  const newDay = !updateDay ? -1 : // Unscheduled
    result.findIndex((entry) => entry?.day === updateDay) // Specific date
  
  // Unscheduled OR date not found
  if (newDay === -1) result[noDateIdx].events.push(id)
  // No slot
  else if (!update.slot) result[newDay].events.push(id)
  // Specific slot
  else result[newDay].events[update.slot - 1] = id
  return result
}
