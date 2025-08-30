import type { MouseEventHandler } from "react";
import type { FormElementProps } from "../InputForm.d";
import {
  invalidHandler,
  useNumberPicker,
} from "../services/numberPicker.controller";

export default function NumberPicker<Data extends Record<string, any>>({
  inputProps,
  className = "",
  wrapperClass = "",
}: FormElementProps<Data>) {
  const { decHandler, incHandler } = useNumberPicker(inputProps);

  return (
    <div className={`join ${wrapperClass}`}>
      {!inputProps.disabled && (
        <NumberButtonStyle increment={false} handler={decHandler} />
      )}
      <input
        {...inputProps}
        className={`join-item ${className}`}
        onInvalid={invalidHandler}
      />
      {!inputProps.disabled && (
        <NumberButtonStyle increment={true} handler={incHandler} />
      )}
    </div>
  );
}

const NumberButtonStyle = ({
  increment,
  handler,
}: {
  increment?: boolean;
  handler?: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    type="button"
    data-action={increment ? "increment" : "decrement"}
    className="btn btn-ghost btn-sm sm:btn-md join-item"
    disabled={!handler}
    onClick={handler}
  >
    {increment ? "＋" : "－"}
  </button>
);
