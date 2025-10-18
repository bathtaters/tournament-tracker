import type { RootState } from "core/store/store";
import { useSelector } from "react-redux";
import { FocusTrap } from "focus-trap-react";
import RawData from "../RawData/RawData";
import {
  AlertButton,
  AlertButtonWrapperStyle,
  AlertMessageStyle,
  alertModalClass,
  AlertTitleStyle,
  BreakMessage,
  CloseButton,
  ModalStyle,
} from "./AlertStyles";
import { getButtonProps, useCloseAlert } from "./alert.services";
import { useHotkeys } from "../General/services/basic.services";

/* *** ALERT OPTIONS *** *\
  Title = header text
  Message = body text
  ClassName = extra modal classes
  ShowClose = forces showing/not window close button (i.e., [X]), otherwise shows only w/ no buttons
  EscValue = false disables Esc, truthy makes EscValue close result on <Esc>
  Buttons = [ ...buttonLabels ] (onClick => clickedButtonLabel)
    OR
  Buttons = { value: returnValue, id: uniqueId, label: displayText, ...propsForwardedToInputTag }
\* *** *** **** *** *** */

// Alert base component
function Alert() {
  // Get alert settings
  const alertOptions = useSelector((state: RootState) => state.alert);
  const { isOpen, title, message, buttons, className, showClose, escValue } =
    alertOptions;

  // Close alert
  const close = useCloseAlert();

  // Setup hotkeys
  useHotkeys(
    {
      Enter: () => (document.activeElement as HTMLButtonElement)?.click?.(), // Enter: Click if on a clickable object
      Escape: (escValue ?? true) ? () => close(escValue || undefined) : null,
    },
    { skip: !isOpen, deps: [close] },
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
          <CloseButton onClick={() => close()} />
        )}

        {title && <AlertTitleStyle>{title}</AlertTitleStyle>}

        {message && (
          <AlertMessageStyle>
            <BreakMessage message={message} />
          </AlertMessageStyle>
        )}

        {buttons && (
          <AlertButtonWrapperStyle>
            {buttons.map((btn, i) => (
              // React key for button is ID => Label => Value => Index
              <AlertButton
                {...getButtonProps(btn, close, i)}
                key={
                  typeof btn === "string"
                    ? btn
                    : btn.key || btn.id || btn.label || btn.value
                }
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
