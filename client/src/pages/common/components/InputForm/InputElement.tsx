import type { FormInput, HandleChange, Setter } from "../../types/InputForm";
import { ElementInput } from "./OtherElements";
import { ElementStyle, LockStyle } from "../../styles/InputFormStyles";
import getInputProps from "../../services/InputForm/inputElement.controller";

type InputElementProps<T> = FormInput<T> & {
  data: T;
  handleChange?: HandleChange<T>;
  setter?: Setter<T>;
  isFragment?: boolean;
};

export default function InputElement<Data extends Record<string, any>>({
  label,
  isFragment,
  className,
  labelClass,
  inputClass,
  inputWrapperClass,
  ...props
}: InputElementProps<Data>) {
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
        inputProps={inputProps}
        className={inputClass}
        wrapperClass={inputWrapperClass}
      />
      {inputProps.disabled && <LockStyle />}
    </ElementStyle>
  );
}
