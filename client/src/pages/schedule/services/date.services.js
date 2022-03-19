import { dayClass } from "../styles/ScheduleStyles";
import { isTempId } from "../../common/services/basic.services";
export { isTempId };

// Key for Unscheduled events
export const noDate = 'none';

// Get Date string
const zPad = (num) => (num < 10 ? '0' : '') + num;
const toDate = (dt) => `${dt.getFullYear()}-${zPad(dt.getMonth() + 1)}-${zPad(dt.getDate())}`
export const getToday = () => toDate(new Date());

// Convert Date String to Object
export const toDateObj = (dt) => dt === noDate ? null : new Date(dt+'T00:00');

// Build array of days from start/end dates
export function getDays(start, end) {
  let arr = [noDate];
  end = toDateObj(end);
  for (let d = toDateObj(start); d <= end; d.setDate(d.getDate() + 1)) {
    arr.push(toDate(d));
  }
  return arr;
}

// Component class styles
export const dayClasses = (day, today) => {
  if (!today) today = getToday();
  return day === today ? dayClass.today :
    !day || day === noDate ? dayClass.future :
    new Date(day) < toDateObj(today) ? dayClass.past : dayClass.future;
}