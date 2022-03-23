import React from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

import RawData from "./RawData";
import OverlayContainer from "./styles/OverlayContainer";
import {
  AlertTitleStyle, AlertMessageStyle, AlertButtonWrapperStyle, AlertButtonStyle, 
  ModalStyle, CloseButton, overlayClasses, alertModalClass,
} from "./styles/AlertStyles";

import { useCloseAlert } from "./services/alert.services";


// Render into root separate root to allow Alerts on top of modals
const alertRoot = document.getElementById('alert-root');


// Alert base component
export default function Alert({ className = alertModalClass }) {
  // Get alert settings
  const { isOpen, title, message, buttons, result } = useSelector((state) => state.alert)
  
  // Close alert
  const close = useCloseAlert()

  // Render Alert Component to AlertRoot
  return createPortal(isOpen && (
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

          <RawData data={{ isOpen, title, message, buttons, result }} className="text-xs" />

        </ModalStyle>
      </FocusTrap>
    </OverlayContainer>
  ), alertRoot)
}