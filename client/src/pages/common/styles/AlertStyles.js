import { ModalTitleStyle } from "./CommonStyles";
import ModalStyle, { CloseButton, overlayClasses } from "./ModalStyle";

export function AlertButtonStyle(props) {
  return <input className="mx-2" type="button" {...props} />
}

export const AlertTitleStyle = ModalTitleStyle

export function AlertMessageStyle({ children }) {
  return <div className="font-light mb-4">{children}</div>
}

export function AlertButtonWrapperStyle({ children }) {
  return <div className="flex justify-evenly">{children}</div>
}

export const alertModalClass = "text-center p-4 max-w-xs sm:max-w-sm"

export { ModalStyle, CloseButton, overlayClasses  }