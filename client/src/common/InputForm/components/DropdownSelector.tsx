import type { FormElementProps } from "../InputForm.d";
import { splitAttributes } from "../services/inputForm.services";

export default function DropdownSelector<Data extends Record<string, any>>({
  wrapperClass,
  className,
  inputProps,
  handleChange,
}: FormElementProps<Data>) {
  const { options, placeholder, attributes } = splitAttributes(
    inputProps,
    handleChange,
  );
  return (
    <select {...attributes} className={className}>
      {placeholder && (
        <option disabled={true} className={wrapperClass}>
          {placeholder}
        </option>
      )}
      {Object.entries(options).map(([value, text]) => (
        <option key={value} value={value} className={wrapperClass}>
          {text}
        </option>
      ))}
    </select>
  );
}
