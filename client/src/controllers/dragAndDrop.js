// Drag & Drop actions

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
  const itemFrom = JSON.parse(ev.dataTransfer.getData("text"));
  action(itemFrom, itemData);
  if (highlightCls) leave(highlightCls)(ev);
  return false;
};


export const preventDef = ev => { ev.preventDefault(); return false; };

const dragHandle = { start, enter, leave, drop, };
export default dragHandle;
