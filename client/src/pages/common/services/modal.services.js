// Constant
const defaultLockMsg = "Are you sure you want to close? Unsaved changes will be lost.";


// Simple controllers
export const closeController = (isLock, open, resetLock) => (overrideLock=false) => {
  if (!overrideLock && isLock) return;
  open(false);
  resetLock();
};

export const msgController = (close, isLock, lockMsg) => () => {
  if(isLock && !window.confirm(lockMsg || defaultLockMsg)) return;
  close(true);
};


// Pass this object to parent via useRef
export const refController = (open, close, lock) => () => ({
  close, // = closeController
  open:   () => open(true),
  unlock: () => lock(false),
  lock:   () => lock(true),
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