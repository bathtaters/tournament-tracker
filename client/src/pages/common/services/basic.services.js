  // EVENT - SERVICES
// Checks that 2 arrays are equal (Must be 1D arrays, 2 falsy vars will also be equal)
export const equalArrays = (a,b) =>
  (!a && !b) || (a && b && 
    a.length === b.length && 
    a.every((v,i) => b[i] === v)
  );

// Generates a temporary ID
const TEMP_ID_PREFIX = 'TEMPID'
export const isTempId = id => id.slice(0,TEMP_ID_PREFIX.length) === TEMP_ID_PREFIX; 
const tempId = type => n => `${TEMP_ID_PREFIX}-${type}-${('0000'+n).slice(-4)}`;
export const nextTempId = (type, exists) => {
  if (!exists) return tempId(type)(0);
  let n = 0, id; const getId = tempId(type);
  while (++n < 10000) { 
    id = getId(n);
    if (!exists.includes(id)) break;
  } return id;
}

// Listen & handle hotkeys
export const hotkeyListener = (handler, enable = true) => () => {
  if (enable) document.addEventListener('keydown', handler, false);
  else document.removeEventListener('keydown', handler, false);
  return () => document.removeEventListener('keydown', handler, false);
};

// keyMap = { [keyCode]: () => action(), ... }
export const hotkeyController = (keyMap) => (e) => {
  // console.debug(' >> KeyCode: ',e.keyCode); // print keycodes
  if (!keyMap[e.keyCode]) return;
  e.preventDefault();
  if (typeof keyMap[e.keyCode] === 'function') keyMap[e.keyCode]();
  else console.error('Malformed keyMap for', e.keyCode,keyMap[e.keyCode]);
};