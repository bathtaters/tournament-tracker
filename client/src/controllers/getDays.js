// Convert date info to date array
// Eventually move to API

// One day in ms
export const oneDay = 24*60*60*1000;

// Get Date string
export const toDate = dt => dt ? dt.toISOString().slice(0,10) : 'none';
export const toDateObj = dt => dt === 'none' ? null : new Date(dt.replace('-','/'));

// Compare dates (ignoring time)
export const sameDay = (dateA, dateB = (new Date()).getTime()) => {
  if (!dateA || !dateB) return false;
  if ((dateA > dateB ? dateA - dateB : dateB - dateA) > oneDay) return false;
  return (new Date(dateA)).getDate() === (new Date(dateB)).getDate();
}

// Build array of days from start/end dates
export default function getDays(start, end) {
  let arr = ['none'];
  if (end < start) return arr;
  for (let d = start; d <= end; d += oneDay) {
    arr.push(toDate(new Date(d)));
  }
  return arr;
}

// Component class styles
export const dayClasses = day => {
  const today = new Date();
  if (day === toDate(today)) return { titleCls: "max-color", borderCls: "pos-border" };
  return (day === 'none' || new Date(day) < today) ?
    { titleCls: "dim-color-inv", borderCls: "dimmer-border" } :
    { titleCls: "base-color",    borderCls: "base-border" };
}