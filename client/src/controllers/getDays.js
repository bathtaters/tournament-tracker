// Convert date info to date array
// Eventually move to API

const oneDay = 24*60*60*1000;

export const sameDay = (dateA, dateB = new Date()) => 
  dateA && dateB && dateA.getDate() === dateB.getDate() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getFullYear() === dateB.getFullYear();


const dayArray = (start, end) => {
  if (end < start) return [];
  let arr = []; const e = end.getTime();
  for (let d = start.getTime(); d < e; d += oneDay) {
    arr.push(new Date(d));
  }
  return arr;
}

const mapDates = dayta => day => dayta.find(d => sameDay(d.day,day)) || ({day});


export default function getDays(range, scheduleData) {
  let days = dayArray(...range);
  days = days.map(mapDates(scheduleData));
  days.unshift(scheduleData.find(d => !d.day) || {});
  return days;
}