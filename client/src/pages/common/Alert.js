import React from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

import RawData from "./RawData";
import OverlayContainer from "./components/OverlayContainer";
import {
  AlertTitleStyle, AlertMessageStyle, AlertButtonWrapperStyle, AlertButton, 
  ModalStyle, CloseButton, alertModalClass,
} from "./styles/AlertStyles";

import { getButtonProps, useCloseAlert, breakMessage } from "./services/alert.services";
import { useHotkeys } from "./services/basic.services";

/* *** ALERT OPTIONS *** *\
  Title = header text
  Message = body text
  ClassName = extra modal classes
  DefaultResult = result passed to Close when closed via window [X] or <Esc>
  ShowClose = forces showing/not window close button (ie. [X]), otherwise shows only w/ no buttons
  EscValue = false disables Esc, truthy makes EscValue close result on <Esc>, otherwise enables w/ defaultResult
  Buttons = [ ...buttonLabels ] (onClick => clickedButtonLabel)
    OR
  Buttons = { value: returnValue, id: uniqueId, label: displayText, ...propsForwardedToInputTag }
\* *** *** **** *** *** */

// Render into root separate root to allow Alerts on top of modals
const alertRoot = document.getElementById('alert-root');

// Alert base component
function Alert() {
  // Get alert settings
  const alertOptions = useSelector((state) => state.alert)
  const { isOpen, title, message, buttons, className, showClose, escValue } = alertOptions
  
  // Close alert
  const close = useCloseAlert()

  // Setup hotkeys
  useHotkeys({
    13: () => document.activeElement?.click(), // Enter: Click if on a clickable object
    27: escValue ?? true ? () => close(escValue || undefined) : null,
  }, { skip: !isOpen, deps: [close] })

  // Render Alert Component to AlertRoot
  return createPortal(isOpen && (
    <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
      <ModalStyle className={alertModalClass + (className ?? '')} z={90}>
        { Boolean(showClose ?? !buttons?.length) && <CloseButton onClick={() => close(showClose || undefined)} /> }

        {title && <AlertTitleStyle>{title}</AlertTitleStyle>}

        {message && <AlertMessageStyle>{breakMessage(message)}</AlertMessageStyle>}

        {buttons &&
          <AlertButtonWrapperStyle>
            { buttons.map((button,i) => <AlertButton {...getButtonProps(button, close, i)} />) }
          </AlertButtonWrapperStyle>
        }

        <RawData data={alertOptions} className="text-xs" />

      </ModalStyle>
    </FocusTrap>
  ), alertRoot)
}

export default Alert