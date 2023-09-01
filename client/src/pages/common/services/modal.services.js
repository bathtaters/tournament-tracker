import { useCallback, useImperativeHandle } from "react";
import { modalCloseAlert } from "../../../assets/alerts";


// Simple handlers
export const useCloseController = (isLock, open, lock, startLocked) => 
  useCallback((overrideLock=false) => {
    if (!overrideLock && isLock) return;
    open(false);
    lock(startLocked);
  }, [isLock, startLocked, open, lock]);

export const useMsgController = (openAlert, close, isLock, lockAlert) => 
  useCallback(() => {
    if (!isLock) return close(true)
    return openAlert(modalCloseAlert(lockAlert), 0).then(r => r && close(true))
  }, [close, isLock, lockAlert, openAlert]);


// Pass this object to parent via useRef
export const useRefController = (ref, open, close, lock) =>
  useImperativeHandle(ref, () => ({
    close, // = closeController
    open:   () => open(true),
    unlock: () => lock(false),
    lock:   () => lock(true),
  }), [open, close, lock]);
