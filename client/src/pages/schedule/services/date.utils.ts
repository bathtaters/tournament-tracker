import { dayClass } from "../styles/ScheduleStyles";
import { isTempId } from "../../../common/General/services/basic.services";

export { isTempId };

// Key for Unscheduled events
export const noDate = "none";

// Get Date string
const zPad = (num: number) => (num < 10 ? "0" : "") + num;
const toDate = (dt: Date) =>
  `${dt.getFullYear()}-${zPad(dt.getMonth() + 1)}-${zPad(dt.getDate())}`;
export const getToday = () => toDate(new Date());

// Convert Date String to Object
export const toDateObj = (dt: string) =>
  dt === noDate ? null : new Date(dt + "T00:00");

// Build array of days from start/end dates
export function getDays(start: string, end: string) {
  let arr = [];
  const endDt = toDateObj(end);
  for (let d = toDateObj(start); d <= endDt; d.setDate(d.getDate() + 1)) {
    arr.push(toDate(d));
  }
  return arr;
}

// Component class styles
export const dayClasses = (day: string, today?: string) => {
  if (!today) today = getToday();
  return day === today
    ? dayClass.today
    : !day || day === noDate
      ? dayClass.future
      : new Date(day) < toDateObj(today)
        ? dayClass.past
        : dayClass.future;
};

// Sort events based on slot numbers
//  eventSlots = { [eventId]: slotNumber, ... }
export function sortedEvents(
  eventSlots: Record<string, number>,
  existing: string[] = [],
) {
  let sorted = [...existing]; // copy input array
  if (!eventSlots) return sorted; // skip if no data provided

  let unsorted = [];
  for (const [event, slot] of Object.entries(eventSlots)) {
    // Index based on slot number
    if (slot && !sorted[slot - 1]) sorted[slot - 1] = event;
    // If duplicate or missing slot, place in unsorted
    else unsorted.push(event);
  }

  // Append unsorted events to end
  return sorted.concat(unsorted);
}

// Serialize all dates within an object
export function serializeDates(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  else if (typeof obj.toISOString === "function") return obj.toISOString();
  else if (Array.isArray(obj)) return obj.map((val) => serializeDates(val));
  return Object.keys(obj).reduce(
    (coll, key) => ({ ...coll, key: serializeDates(obj[key]) }),
    {},
  );
}
