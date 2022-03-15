import { dayClass } from "../styles/ScheduleStyles";
import { isTempId } from "../../common/services/basic.services";
export { isTempId };

// Key for Unscheduled events
export const noDate = 'none';

// Get Date string
const zPad = (num) => (num < 10 ? '0' : '') + num;
export const toDate = (dt) => `${dt.getFullYear()}-${zPad(dt.getMonth() + 1)}-${zPad(dt.getDate())}`
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
export const dayClasses = day => {
  const today = new Date();
  return day === toDate(today) ? dayClass.today :
    (!day || day === noDate || new Date(day) < today) ?
    dayClass.past : dayClass.future;
}

// Get events w/o date or w/ date outside range
export const getMissingEvents = (sched, range) => !sched || !range ? [] :
  Object.keys(sched)
    .filter(d => d === noDate || !range.includes(d))
    .reduce((list,d)=>list.concat(sched[d].events || []),[]);