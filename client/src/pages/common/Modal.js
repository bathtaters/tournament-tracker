import { useLayoutEffect } from "react"
import { FocusTrap } from "focus-trap-react"
import { ModalStyle, CloseButton } from "./styles/ModalStyle"
import useModal from "./services/modal.services"
import { useHotkeys } from "./services/basic.services"
import { useAlertStatus } from "./common.hooks"


// Modal base component
function Modal({ backend: { isOpen, isLocked, close, closeWithMsg }, className = 'sm:max-w-3xl', bgClose = true, children }) {
  const alertIsOpen = useAlertStatus()
  
  // Link HotKeys -> Functions
  useHotkeys({
    Enter: () => document.activeElement?.click(), // Enter: Click if on a clickable object
    Escape: !isLocked && close,  // Esc: Close Modal
  }, { skip: alertIsOpen || !isOpen, deps: [close] });

  // Freeze background scrolling
  useLayoutEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }, [isOpen])

  // Render into modalRoot
  return (
    <FocusTrap active={isOpen} paused={alertIsOpen} focusTrapOptions={{ escapeDeactivates: false }}>    
      <ModalStyle isOpen={isOpen} onClick={bgClose ? close : undefined} className={className}>
        <CloseButton onClick={closeWithMsg} />
        {isOpen && children}
      </ModalStyle>
    </FocusTrap>
  )
}

export { Modal, useModal }