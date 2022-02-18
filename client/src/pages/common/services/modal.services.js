// Constant
const defaultLockMsg = "Are you sure you want to close? Unsaved changes will be lost.";


// Simple controllers
export const closeController = (closeDisabled, setOpen, resetLock) => (overrideLock=false) => {
  if (!overrideLock && closeDisabled) return;
  setOpen(false);
  resetLock();
};

export const msgController = (close, closeDisabled, lockMsg) => () => {
  if(closeDisabled && !window.confirm(lockMsg || defaultLockMsg)) return;
  close(true);
};


// Pass this object to parent via useRef
export const refController = (setOpen, close, disableClose) => () => ({
  open:  () => setOpen(true),
  close,
  unlock:  () => disableClose(false),
  lock: () => disableClose(true),
});


// Listen & handle hotkeys
export const listenController = (listen, handler) => () => {
  if (listen) document.addEventListener('keydown', handler, false);
  return () => document.removeEventListener('keydown', handler, false);
};

// keyMap = { [keyCode]: () => action(), ... }
export const keysController = (keyMap) => (e) => {
  // console.debug(' >> KeyCode: ',e.keyCode); // print keycodes
  if (!keyMap[e.keyCode]) return;
  if (typeof keyMap[e.keyCode] === 'function') keyMap[e.keyCode]();
  else console.error('Malformed keyMap for', e.keyCode,keyMap[e.keyCode]);
};