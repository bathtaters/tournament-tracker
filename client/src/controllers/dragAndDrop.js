// Drag & Drop actions
const isoDateRe = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?\w/;

const parseDates = obj => {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map(parseDates);
    if (!obj) return obj;
    Object.keys(obj).forEach(k => obj[k] = parseDates(obj[k]));
  } else if (typeof obj === 'string' && isoDateRe.test(obj)) {
    return new Date(obj);
  }
  return obj;
}

// Start Drag
const start = itemData =>
  ev => ev.dataTransfer.setData("text/plain", JSON.stringify(itemData));

// Apply highlight classes while dragging over
const enter = highlightCls =>
  ev => highlightCls.forEach(c => ev.target.classList.add(c));
const leave = highlightCls =>
  ev => highlightCls.forEach(c => ev.target.classList.remove(c));

// End Drag (Highlight Class clears any highlight classes still remaining)
const drop = (itemData,action,highlightCls=null) => ev => {
  preventDef(ev);
  ev.stopPropagation();
  const itemFrom = parseDates(JSON.parse(ev.dataTransfer.getData("text")));
  action(itemFrom, itemData);
  if (highlightCls) leave(highlightCls)(ev);
  return false;
};


export const preventDef = ev => { ev.preventDefault(); return false; };

const dragHandle = { start, enter, leave, drop, };
export default dragHandle;
