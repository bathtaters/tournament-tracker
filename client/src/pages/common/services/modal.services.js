import openAlert from "../Alert";

// Constant
const defaultLockMsg = "Are you sure you want to close? Unsaved changes will be lost.";


// Simple controllers
export const closeController = (isLock, open, resetLock) => (overrideLock=false) => {
  if (!overrideLock && isLock) return;
  open(false);
  resetLock();
};

export const msgController = (close, isLock, lockMsg) => async () => {
  const forceClose = isLock ? await openAlert(lockMsg || defaultLockMsg, ["Yes","No"]) : "Yes"
  if(forceClose === 'Yes') close(true);
};


// Pass this object to parent via useRef
export const refController = (open, close, lock) => () => ({
  close, // = closeController
  open:   () => open(true),
  unlock: () => lock(false),
  lock:   () => lock(true),
});
