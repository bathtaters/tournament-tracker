// Drag & Drop actions

// Date parsing
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

// Data extraction helpers
const getStored = (ev, dataType, ignoreDates=true) => {
  let data = ev.dataTransfer.getData(dataType);
  if (!data) return data;
  data = JSON.parse(data);
  if (!ignoreDates) data = parseDates(data);
  return data;
}
const getPublicData = (ev, privateDataType) => ev.dataTransfer.types.find(t => !privateDataType || privateDataType !== t);
const getDataUsing = (getData, args = []) => typeof getData === 'function' ? getData(...args) : getData;


// Start Drag
const start = (getData, getTestData, dataType='text/json') =>
  ev => {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.dropEffect = "move";
    ev.dataTransfer.setData(
      dataType,
      JSON.stringify(getDataUsing(getData, [ev]))
    );
    if (getTestData) ev.dataTransfer.setData(
      typeof getTestData === 'function' ? getTestData(ev) : getTestData,
      "PUBLIC"
    );
  };

// Apply highlight classes while dragging over
const enter = (highlightCls, illegalCls, canDrop, getData, privateDataType) =>
  ev => {
    if (canDrop) {
      if (!canDrop(
        ev.dataTransfer.types,
        getDataUsing(getData, [ev]),
        getPublicData(ev, privateDataType),
        ev
      )) return illegalCls.forEach(c => ev.target.classList.add(c));
    }
    highlightCls.forEach(c => ev.target.classList.add(c));
  };

const leave = (highlightCls, illegalCls, canDrop, getData, privateDataType) =>
  ev => {
    if (canDrop) {
      if (!canDrop(
        ev.dataTransfer.types,
        getDataUsing(getData, [ev]),
        getPublicData(ev, privateDataType),
        ev
      )) return illegalCls.forEach(c => ev.target.classList.remove(c));
    }
    highlightCls.forEach(c => ev.target.classList.remove(c));
  };

// End Drag (Highlight Class clears any highlight classes still remaining)
const drop = (getData, action, highlightCls=null, canDrop, getCanDropData, dataType='text/json') => ev => {
  preventDef(ev); ev.stopPropagation();

  if (canDrop && !canDrop(
    ev.dataTransfer.types,
    getDataUsing(getCanDropData, [ev]),
    getPublicData(ev, dataType),
    ev
  )) return;

  action(getStored(ev, dataType, true), getDataUsing(getData, [ev,dataType]));
  if (highlightCls) leave(highlightCls)(ev);
  return false;
};


export const preventDef = ev => { ev.preventDefault(); return false; };

const dragHandle = { start, enter, leave, drop, };
export default dragHandle;
