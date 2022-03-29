import { modalCloseAlert } from "../../../assets/alerts";


// Simple handlers
export const closeController = (isLock, open, resetLock) => (overrideLock=false) => {
  if (!overrideLock && isLock) return;
  open(false);
  resetLock();
};

export const msgController = (openAlert, close, isLock, lockAlert) => () => {
  if (!isLock) return close(true)
  return openAlert(modalCloseAlert(lockAlert), 0).then(r => r && close(true))
};


// Pass this object to parent via useRef
export const refController = (open, close, lock) => () => ({
  close, // = closeController
  open:   () => open(true),
  unlock: () => lock(false),
  lock:   () => lock(true),
});
