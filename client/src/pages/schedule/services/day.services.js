import { useCallback } from "react";
import { useSetEventMutation } from "../schedule.fetch";
import { noDate } from "./date.utils";
import { dragType } from "../../../assets/constants";
export const dataType = dragType.event;

// Drag & Drop tester
export const canDrop = (type, a, b) =>
  type === dataType && a.id !== b.id && !(b.day === noDate && a.day === noDate);

// Drop handler
// a & b = { id, day, slot } or { day: noDate } (Unscheduled box)
export function useUpdateSchedule() {
  const [updateEvent] = useSetEventMutation();

  return useCallback(
    (a, b) => {
      // Skip rules
      if (a.id === b.id || (b.day === noDate && a.day === noDate)) return;

      // Swap data
      swapKeys(a, b, "day");
      swapKeys(a, b, "slot");

      // Fetch updates
      updateEvent(a);
      if (b.id) updateEvent(b);
    },
    [updateEvent]
  );
}

// Drop Helper
const swapKeys = (a, b, key) => {
  let tmp = a[key];
  if (a.id) {
    if (!b[key]) delete a[key];
    else a[key] = b[key] === noDate ? null : b[key];
  }
  if (b.id) {
    if (!tmp) delete b[key];
    else b[key] = tmp === noDate ? null : tmp;
  }
};
