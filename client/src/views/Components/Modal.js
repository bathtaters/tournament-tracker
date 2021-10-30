import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";

// Where to render
const modalElement = document.getElementById('modal-root');

// Constants
const defaultLockMsg = "Are you sure you want to close? Unsaved changes will be lost.";
const containerClasses = "fixed top-0 left-0 z-40 w-screen h-screen p-8 flex justify-center items-center";
const overlayClasses = "absolute w-full h-full base-bgd bg-opacity-50";
const modalClasses = "relative max-h-full overflow-auto p-8 alt-bgd shadow-lg rounded-lg";

// Modal base component
export function Modal({ children, className = '', bgdClose = true, startOpen = false, startLocked = false, lockMsg = '' }, ref) {
  const [isOpen, setOpen] = useState(startOpen);
  const [closeDisabled, disableClose] = useState(startLocked);

  const close = useCallback((overrideLock=false) => {
    if (!overrideLock && closeDisabled) return;
    setOpen(false);
    disableClose(startLocked);
  }, [closeDisabled, startLocked]);

  const closeWithMsg = useCallback(() => {
    if(closeDisabled && !window.confirm(lockMsg || defaultLockMsg)) return;
    close(true);
  }, [close, closeDisabled, lockMsg]);

  // Pass open/close methods to parent
  useImperativeHandle(ref, () => ({
    open:  () => setOpen(true),
    close,
    unlock:  () => disableClose(false),
    lock: () => console.log('window', closeDisabled ? 'unlocked' : 'locked') || disableClose(!closeDisabled),
  }), [setOpen, close, disableClose, closeDisabled]);

  // Capture keystrokes
  const keystrokeHandler = useCallback(e => {
    // console.log('keystroke: ',e.keyCode);
    // Escape
    if (e.keyCode === 27) close();
  }, [close]);

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', keystrokeHandler, false);
    return () => document.removeEventListener('keydown', keystrokeHandler, false);
  }, [keystrokeHandler, isOpen]);

  // Render
  return createPortal(
    isOpen ? (<div className={containerClasses}>
      <div className={overlayClasses}  onClick={bgdClose ? () => close() : null} />
      <div className={`${modalClasses} ${className}`}>
        <input type="button" className="absolute top-0 right-0" aria-label="Close" value="x" onClick={closeWithMsg} />
        {children}
      </div>
    </div>) : null,
    modalElement
  )
}

export default forwardRef(Modal);