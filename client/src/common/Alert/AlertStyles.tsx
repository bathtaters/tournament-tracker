import { ModalTitleStyle } from "../General/styles/CommonStyles";
import { CloseButton, ModalStyle } from "../Modal/ModalStyle";

export function AlertButton({ className, ...props }) {
  return (
    <input
      type="button"
      className={"mx-2 btn btn-sm sm:btn-md " + (className || "btn-warning")}
      {...props}
    />
  );
}

export const AlertTitleStyle = ModalTitleStyle;

export function AlertMessageStyle({ children }) {
  return <div className="font-light mb-4">{children}</div>;
}

export function AlertButtonWrapperStyle({ children }) {
  return <div className="flex justify-evenly">{children}</div>;
}

export const alertModalClass = "text-center p-4 max-w-xs sm:max-w-sm ";

export { ModalStyle, CloseButton };

export const BreakMessage = ({ message }: { message: string }) => (
  <>
    {message.split("\n").map((line, idx) => (
      <div key={idx}>{line}</div>
    ))}
  </>
);
