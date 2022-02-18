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
  const [isOpen, setOpen] = useState(startOpen);

  const [closeDisabled, disableClose] = useState(startLocked);

  const close = useCallback(
    closeController(closeDisabled, setOpen, ()=>disableClose(startLocked)),
    [closeDisabled, startLocked, setOpen, disableClose]
  );

  const closeWithMsg = useCallback(msgController(close, closeDisabled, lockMsg), [close, closeDisabled, lockMsg]);
  

  // Setup ref functions
  useImperativeHandle(ref, refController(setOpen, close, disableClose), [setOpen, close, disableClose]);
  

  // Setup hotkeys
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