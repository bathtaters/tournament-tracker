import React, { useState, forwardRef, useLayoutEffect } from "react";
import { FocusTrap } from "focus-trap-react";

import { ModalStyle, CloseButton } from "./styles/ModalStyle";
import { useCloseController, useMsgController, useRefController } from "./services/modal.services";
import { useHotkeys } from "./services/basic.services";
import { useOpenAlert, useAlertStatus } from "./common.hooks"

// Modal base component
function Modal({ children, className = 'sm:max-w-3xl', bgClose = true, startOpen = false, startLocked = false, lockAlert }, ref) {

  // Modal actions
  const openAlert = useOpenAlert();
  const alertIsOpen = useAlertStatus();
  const [isOpen, open] = useState(startOpen);
  const [isLock, lock] = useState(startLocked);
  const close = useCloseController(isLock, open, lock, startLocked);
  const closeWithMsg = useMsgController(openAlert, close, isLock, lockAlert);
  
  // Setup ref functions
  useRefController(ref, open, close, lock);
  
  // Link HotKeys -> Functions
  useHotkeys({
    Enter: () => document.activeElement?.click(), // Enter: Click if on a clickable object
    Escape: !isLock && close,  // Esc: Close Modal
  }, { skip: alertIsOpen || !isOpen, deps: [close] });

  // Freeze background scrolling
  useLayoutEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }, [isOpen])

  // Render into modalRoot
  return (
    <FocusTrap active={isOpen} paused={alertIsOpen} focusTrapOptions={{ escapeDeactivates: false }}>    
      <ModalStyle isOpen={isOpen} onClick={bgClose ? () => close() : null} className={className}>
        <CloseButton onClick={closeWithMsg} />
        {isOpen && children}
      </ModalStyle>
    </FocusTrap>
  )
}

export default forwardRef(Modal);