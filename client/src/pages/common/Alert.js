import React from "react";
import FocusTrap from "focus-trap-react";

import OverlayContainer from "./styles/OverlayContainer";
import {
  AlertTitleStyle, AlertMessageStyle, AlertButtonWrapperStyle, AlertButtonStyle, 
  ModalStyle, CloseButton, overlayClasses, alertModalClass,
} from "./styles/AlertStyles";

import { openAsPromise, clickHandler } from "./services/alert.services";

// Alert base component
function Alert({ title, message, buttons, className = alertModalClass, callback }) {

  const close = clickHandler(callback)

  // Alert Component (Based off Modal)
  return (
    <OverlayContainer className={overlayClasses} z={5}>
      <FocusTrap>
        <ModalStyle className={className}>
          {!buttons && <CloseButton onClick={() => close('Close')} />}

          {title && <AlertTitleStyle>{title}</AlertTitleStyle>}

          {message && <AlertMessageStyle>{message}</AlertMessageStyle>}

          {buttons &&
            <AlertButtonWrapperStyle>
              {buttons.map(value =>
                <AlertButtonStyle value={value} onClick={() => close(value)} key={value} />
              )}
            </AlertButtonWrapperStyle>
          }

        </ModalStyle>
      </FocusTrap>
    </OverlayContainer>
  )
}

// Create Alert interface
const openAlert = openAsPromise(Alert)
export default openAlert