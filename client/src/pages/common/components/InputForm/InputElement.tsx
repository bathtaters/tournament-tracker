import type { FormInput } from "../../types/InputForm";
import { ElementInput } from "./OtherElements";
import { ElementStyle, LockStyle } from "../../styles/InputFormStyles";
import getInputProps from "../../services/InputForm/inputElement.controller";

export default function InputElement<Data>({
  label,
  isFragment,
  className,
  labelClass,
  inputClass,
  inputWrapperClass,
  ...props
}: FormInput<Data>) {
  // Get element props
  const inputProps = getInputProps(props, label);

  return (
    <ElementStyle
      className={className}
      isFragment={isFragment}
      inputProps={inputProps}
      label={label}
      labelClass={labelClass}
    >
      <ElementInput
        className={inputClass}
        wrapperClass={inputWrapperClass}
        inputProps={inputProps}
      />
      {inputProps.disabled && <LockStyle />}
    </ElementStyle>
  );
}
