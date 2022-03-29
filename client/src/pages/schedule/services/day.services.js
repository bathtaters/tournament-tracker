import { useCallback } from "react";
import { useSetEventMutation } from "../schedule.fetch";
import { noDate } from "./date.utils";
import { dragType } from "../../../assets/constants";
export const dataType = dragType.event;

// Drag & Drop tester
export const canDrop = (types, target, self) => types.includes(dataType) && (target !== noDate || self !== noDate);

// Drop handler
// a & b = { id, day, slot } or { day: noDate } (Unscheduled box)
export function useUpdateSchedule() {
  const [ updateEvent ] = useSetEventMutation()

  return useCallback((a,b) => {
    // Skip rules
    if (a.id === b.id || b.day === noDate && a.day === noDate) return;
    
    // Swap data
    swapKeys(a,b,'day');
    swapKeys(a,b,'slot');
    [a,b].map(d => { if (!d.slot) delete d.slot });
    
    // Fetch updates
    updateEvent(a)
    if (b.id) updateEvent(b)

  }, [updateEvent, noDate])
}

// Drop Helper
const swapKeys = (a,b,key) =>
  [a[key], b[key]] = [b[key], a[key]].map(d => key === 'day' && d === noDate ? null : d);