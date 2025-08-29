import type {
  FormInput,
  InputAttributes,
  InputOptions,
  Interval,
  TimePlace,
} from "../../types/InputForm";
import { defaultInputType } from "../../components/InputForm/OtherElements";

export default function getInputProps<Data>(
  {
    id: inputId,
    type,
    data,
    limits,
    min,
    max,
    onChange,
    onBlur,
    disabled,
    required,
  }: Partial<FormInput<Data>>,
  label = "",
) {
  const id = inputId || label.replace(/\W/g, "");
  const valueAsNumber = type === "number" || type === "time";

  // Build register options
  const options: InputOptions = {
    id,
    valueAsNumber,
    onChange,
    onBlur,
    required,
    limits,
    value: data?.[id],
    type: type || defaultInputType,
    disabled: typeof disabled === "function" ? disabled(data) : disabled,
    pattern: valueAsNumber ? "/^\\d*$/" : undefined,
    ...getLimit("min", limits, valueAsNumber, min, data),
    ...getLimit("max", limits, valueAsNumber, max, data),
  };

  // Build FormData props
  if (type !== "time") return baseProps(options, data);

  return {
    ...baseProps(options, data),
    hours: timeOptions("hours", options),
    minutes: timeOptions("minutes", options),
    seconds: timeOptions("seconds", options),
  };
}

// --- Helpers --- \\

const baseProps = <Data>(
  {
    id,
    type,
    value,
    disabled,
    required,
    onChange,
    onBlur,
    min,
    max,
    minLength,
    maxLength,
  }: InputOptions,
  data: Data,
): InputAttributes =>
  type === "checkbox"
    ? {
        id,
        type,
        disabled,
        required,
        name: id,
        checked: Boolean(value),
        onChange: (ev) => onChange?.(id, ev.target.checked),
        onBlur:
          typeof onBlur !== "function"
            ? undefined
            : (ev) => {
                const newValue = onBlur(ev.target.checked, data);
                onChange?.(id, newValue);
              },
      }
    : {
        id,
        type,
        value,
        disabled,
        required,
        min,
        max,
        minLength,
        maxLength,
        name: id,
        onChange: (ev) => onChange?.(id, ev.target.value),
        onBlur:
          typeof onBlur !== "function"
            ? undefined
            : (ev) => {
                const newValue = onBlur(ev.target.value, data);
                onChange?.(id, newValue);
              },
      };

const timeOptions = (
  place: TimePlace,
  {
    id,
    value,
    onChange,
    limits,
    valueAsNumber,
    onBlur,
    ...props
  }: InputOptions,
): InputAttributes => ({
  ...props,
  ...getLimit("min", limits?.[place], valueAsNumber),
  ...getLimit("max", limits?.[place], valueAsNumber),
  id: `${id}.${place}`,
  value: value?.[place],
  type: "number",
  onChange: (ev) => {
    onChange(id, (time: Interval) => ({
      ...time,
      [place]: +(ev.target.value || 0),
    }));
  },
});

const getLimit = <Data>(
  key: "min" | "max",
  limits?: InputOptions["limits"],
  isNumber = false,
  override?: number | ((data: Data) => number),
  data?: Data,
): { min?: number; max?: number; minLength?: number; maxLength?: number } => {
  const value = typeof override === "function" ? override(data) : override;
  if (typeof value === "number")
    return { [isNumber ? key : `${key}Length`]: value };
  if (typeof limits?.[key] !== "number") return {};
  return { [isNumber ? key : `${key}Length`]: limits[key] };
};
