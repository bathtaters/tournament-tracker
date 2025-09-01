import type { FormElementProps } from "../InputForm.d";
import DropdownSelector from "./DropdownSelector";
import NumberPicker from "./NumberPicker";
import RangeSelector from "./RangeSelector";
import TimePicker from "./TimePicker";
import { elementDefaults, typeDefaults } from "../InputFormStyles";

export const defaultInputType = "text"; // Default <input> "type" attribute

export function ElementInput<Data extends Record<string, any>>({
  inputProps = {},
  className,
  wrapperClass,
}: FormElementProps<Data>) {
  const inputClass = `${
    typeDefaults[inputProps.type || defaultInputType] ?? inputProps.type ?? ""
  } ${className ?? elementDefaults.inputClass}`;

  if (inputProps.type === "select") {
    return (
      <DropdownSelector
        inputProps={inputProps}
        className={inputClass}
        wrapperClass={wrapperClass}
      />
    );
  }

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
        inputProps={inputProps}
        className={inputClass}
        wrapperClass={wrapperClass}
      />
    );

  if (inputProps.type === "time")
    return (
      <TimePicker
        inputProps={inputProps as any}
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
