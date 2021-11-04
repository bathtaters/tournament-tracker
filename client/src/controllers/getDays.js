// Convert date info to date array
// Eventually move to API

// One day in ms
const oneDay = 24*60*60*1000;

// Compare dates (ignoring time)
export const sameDay = (dateA, dateB = (new Date()).getTime()) => {
  if (!dateA || !dateB) return false;
  if ((dateA > dateB ? dateA - dateB : dateB - dateA) > oneDay) return false;
  return (new Date(dateA)).getDate() === (new Date(dateB)).getDate();
}

// Build array of days from start/end dates
const dayArray = (start, end) => {
  if (end < start) return [];
  let arr = []; const e = end;
  for (let d = start; d < e; d += oneDay) {
    arr.push(d);
  }
  return arr;
}

// Insert schedule info into day array
const mapDates = schedule => day => {
  let dayta = schedule.find(d => sameDay(d.day, day));
  if (dayta) { dayta = JSON.parse(JSON.stringify(dayta)); }
  return dayta || {day};
}

// Convert range limits & schedule data into ordered array
export default function getDays(range, scheduleData) {
  let days = dayArray(...range);
  days = days.map(mapDates(scheduleData));
  days.unshift(scheduleData.find(d => !d.day) || {});
  return days;
}