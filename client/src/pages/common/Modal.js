import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

import OverlayContainer from "./styles/OverlayContainer";

// Where to render
const modalElement = document.getElementById('modal-root');

// Constants
const defaultLockMsg = "Are you sure you want to close? Unsaved changes will be lost.";
const containerClasses = "p-8 flex justify-center items-center";
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
    lock: () => disableClose(true),
  }), [setOpen, close, disableClose]);

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
    isOpen && (
    <OverlayContainer className={containerClasses} z={4} onClick={bgdClose ? () => close() : null}>
      <FocusTrap active={isOpen}>
        <div className={`${modalClasses} ${className}`}>
          <input type="button" className="absolute top-0 right-0 m-1" aria-label="Close" value="x" onClick={closeWithMsg} />
          {children}
        </div>
      </FocusTrap>
    </OverlayContainer>),
    modalElement
  )
}

export default forwardRef(Modal);