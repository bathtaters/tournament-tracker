import React, { useState, useImperativeHandle, forwardRef, useCallback, useLayoutEffect } from "react";
import FocusTrap from "focus-trap-react";

import { ModalStyle, CloseButton } from "./styles/ModalStyle";
import { closeController, msgController, refController } from "./services/modal.services";
import { useHotkeys } from "./services/basic.services";
import { useOpenAlert, useAlertStatus } from "./common.hooks"

// Modal base component
function Modal({ children, className = '', bgClose = true, startOpen = false, startLocked = false, lockAlert }, ref) {

  // Modal actions
  const openAlert = useOpenAlert();
  const alertIsOpen = useAlertStatus();
  const [isOpen, open] = useState(startOpen);
  const [isLock, lock] = useState(startLocked);
  const close = useCallback(closeController(isLock, open, ()=>lock(startLocked)), [isLock, startLocked, open, lock]);
  const closeWithMsg = useCallback(msgController(openAlert, close, isLock, lockAlert), [close, isLock, lockAlert]);
  
  // Setup ref functions
  useImperativeHandle(ref, refController(open, close, lock), [open, close, lock]);
  
  // Link HotKeys -> Functions
  useHotkeys({
    13: () => document.activeElement?.click(), // Enter: Click if on a clickable object
    27: !isLock && close,  // Esc: Close Modal
  }, { skip: alertIsOpen || !isOpen, deps: [close] });

  // Freeze background scrolling
  useLayoutEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }, [isOpen])

  // Render into modalRoot
  return isOpen && (
    <FocusTrap paused={alertIsOpen} focusTrapOptions={{ escapeDeactivates: false }}>
      <ModalStyle onClick={bgClose ? () => close() : null} className={className}>
        <CloseButton onClick={closeWithMsg} />
        {children}
      </ModalStyle>
    </FocusTrap>
  )
}

export default forwardRef(Modal);