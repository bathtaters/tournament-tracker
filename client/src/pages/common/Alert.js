import React from "react";
import { useSelector } from "react-redux";
import { FocusTrap } from "focus-trap-react";

import RawData from "./RawData";
import {
  AlertTitleStyle,
  AlertMessageStyle,
  AlertButtonWrapperStyle,
  AlertButton,
  ModalStyle,
  CloseButton,
  alertModalClass,
} from "./styles/AlertStyles";

import {
  getButtonProps,
  useCloseAlert,
  breakMessage,
} from "./services/alert.services";
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

// Alert base component
function Alert() {
  // Get alert settings
  const alertOptions = useSelector((state) => state.alert);
  const { isOpen, title, message, buttons, className, showClose, escValue } =
    alertOptions;

  // Close alert
  const close = useCloseAlert();

  // Setup hotkeys
  useHotkeys(
    {
      Enter: () => document.activeElement?.click(), // Enter: Click if on a clickable object
      Escape: (escValue ?? true) ? () => close(escValue || undefined) : null,
    },
    { skip: !isOpen, deps: [close] }
  );

  // Render Alert Component to AlertRoot
  return (
    <FocusTrap active={isOpen} focusTrapOptions={{ escapeDeactivates: false }}>
      <ModalStyle
        isOpen={isOpen}
        className={alertModalClass + (className ?? "")}
        z="z-90"
      >
        {Boolean(showClose ?? !buttons?.length) && (
          <CloseButton onClick={() => close(showClose || undefined)} />
        )}

        {title && <AlertTitleStyle>{title}</AlertTitleStyle>}

        {message && (
          <AlertMessageStyle>{breakMessage(message)}</AlertMessageStyle>
        )}

        {buttons && (
          <AlertButtonWrapperStyle>
            {buttons.map((btn, i) => (
              // React key for button is ID => Label => Value => Index
              <AlertButton
                {...getButtonProps(btn, close, i)}
                key={btn.key || btn.id || btn.label || btn.value || i}
              />
            ))}
          </AlertButtonWrapperStyle>
        )}

        <RawData data={alertOptions} className="text-xs" />
      </ModalStyle>
    </FocusTrap>
  );
}

export default Alert;
