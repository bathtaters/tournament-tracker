import NumberPicker from "./NumberPicker";
import RangeSelector from "./RangeSelector";
import TimePicker from "./TimePicker";
import {
  elementDefaults,
  RowStyle,
  typeDefaults,
} from "../../styles/InputFormStyles";

export const defaultInputType = "text"; // Default <input> "type" attribute

// FormRow

export function GroupWrapper({ isFragment = false, isRow, children }) {
  if (isFragment) return <>{children}</>;
  return <RowStyle isRow={isRow}>{children}</RowStyle>;
}

export function Spacer({ className }) {
  return <div className={className} />;
}

// InputElement

export function ElementInput({ inputProps = {}, className, wrapperClass }) {
  const inputClass = `${
    typeDefaults[inputProps.type || defaultInputType] ?? inputProps.type ?? ""
  } ${className ?? elementDefaults.inputClass}`;

  if (inputProps.type === "number")
    return (
      <NumberPicker
        inputProps={inputProps}
        className={inputClass}
        wrapperClass={wrapperClass}
      />
    );

  if (inputProps.type === "range")
    return (
      <RangeSelector
        {...inputProps}
        className={inputClass}
        wrapperClass={wrapperClass}
      />
    );

  if (inputProps.type === "time")
    return (
      <TimePicker
        inputProps={inputProps}
        className={inputClass}
        wrapperClass={wrapperClass}
      />
    );

  return (
    <input
      {...inputProps}
      className={`join-item dark:[color-scheme:dark] ${inputClass}`}
    />
  );
}
