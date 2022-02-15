import { noDate } from "./date.services";

// Drag & Drop tester
export const canDrop = types => types.includes("json/eventday");

// Drop handler factory
export const dropController = (updateEvent) => (a,b) => {
  [a.day, b.day] = [b.day, a.day].map(d => d === noDate ? null : d);
  updateEvent(a);
  if (b.id) updateEvent(b);
}