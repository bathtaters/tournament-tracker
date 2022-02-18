import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

import OverlayContainer from "./styles/OverlayContainer";
import ModalStyle, { CloseButton, overlayClasses } from "./styles/ModalStyle";
import { closeController, msgController, refController, listenController, keysController } from "./services/modal.services";

const modalRoot = document.getElementById('modal-root');

// Modal base component
function Modal({ children, className = '', bgdClose = true, startOpen = false, startLocked = false, lockMsg = '' }, ref) {

  // Modal actions
  const [isOpen, open] = useState(startOpen);
  const [isLock, lock] = useState(startLocked);
  const close = useCallback(closeController(isLock, open, ()=>lock(startLocked)), [isLock, startLocked, open, lock]);
  const closeWithMsg = useCallback(msgController(close, isLock, lockMsg), [close, isLock, lockMsg]);
  
  // Setup ref functions
  useImperativeHandle(ref, refController(open, close, lock), [open, close, lock]);
  
  // Link HotKeys -> Functions
  const keystrokeHandler = useCallback(keysController({
    27: close,  // Esc: Close Modal
  }), [close]);
  useEffect(() => listenController(isOpen, keystrokeHandler), [isOpen, keystrokeHandler]);

  // Render into modalRoot
  return createPortal(isOpen && (
    <OverlayContainer className={overlayClasses} z={4} onClick={bgdClose ? () => close() : null}>
      <FocusTrap active={isOpen}>
        <ModalStyle className={className}>
          <CloseButton onClick={closeWithMsg} />
          {children}
        </ModalStyle>
      </FocusTrap>
    </OverlayContainer>),
    modalRoot
  )
}

export default forwardRef(Modal);