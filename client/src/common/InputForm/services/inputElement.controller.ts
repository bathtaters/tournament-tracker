import type { ChangeEvent } from "react";
import type {
  FormInput,
  HandleChange,
  InputAttributes,
  InputOptions,
  InputPropsReturn,
  Setter,
  TimePlace,
} from "../InputForm.d";
import { defaultInputType } from "../components/OtherElements";

type InputGetterProps<T> = Omit<
  FormInput<T>,
  "label" | "className" | "labelClass" | "inputClass" | "inputWrapperClass"
> & {
  data: T;
  handleChange?: HandleChange<T>;
  setter?: Setter<T>;
};

export default function getInputProps<Data>(
  {
    id: inputId,
    type,
    data,
    limits,
    min,
    max,
    handleChange,
    setter,
    disabled,
    hidden,
    required,
  }: InputGetterProps<Data>,
  label = "",
): InputPropsReturn<Data> | null {
  const id = inputId || label.replace(/\W/g, "");
  const valueAsNumber = type === "number" || type === "time";

  if (typeof hidden === "function" ? hidden(data) : hidden) return null;

  // Build register options
  const options: InputOptions<Data> = {
    id,
    valueAsNumber,
    handleChange,
    setter,
    required,
    limits,
    value: data?.[id],
    type: type ?? defaultInputType,
    disabled: typeof disabled === "function" ? disabled(data) : disabled,
    pattern: valueAsNumber ? "/^\\d*$/" : undefined,
    ...getLimit("min", limits, valueAsNumber, min, data),
    ...getLimit("max", limits, valueAsNumber, max, data),
  };

  // Build FormData props
  if (type !== "time") return baseProps(options, data);

  return {
    ...baseProps(options, data),
    hours: timeOptions<Data>("hours", options),
    minutes: timeOptions<Data>("minutes", options),
    seconds: timeOptions<Data>("seconds", options),
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
    handleChange,
    setter,
    min,
    max,
    minLength,
    maxLength,
  }: InputOptions<Data>,
  data: Data,
): InputAttributes<Data> =>
  type === "checkbox"
    ? {
        id,
        type,
        disabled,
        required,
        name: id,
        checked: Boolean(value),
        onChange: (ev) =>
          handleChange?.({
            [id]: (ev as ChangeEvent<HTMLInputElement>).target.checked,
          } as Partial<Data>),
        onBlur:
          typeof setter !== "function"
            ? undefined
            : (ev) => {
                const newValue = setter((ev as any).target.checked, data);
                handleChange?.({ [id]: newValue } as Partial<Data>);
              },
      }
    : typeof type === "object"
      ? {
          id,
          type: "select",
          value,
          disabled,
          required,
          options: type,
          name: id,
          onChange: (ev) =>
            handleChange?.({ [id]: ev.target.value } as Partial<Data>),
          onBlur:
            typeof setter !== "function"
              ? undefined
              : (ev) => {
                  const newValue = setter(ev.target.value as any, data);
                  handleChange?.({ [id]: newValue } as Partial<Data>);
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
          onChange: (ev) =>
            handleChange?.({ [id]: ev.target.value } as Partial<Data>),
          onBlur:
            typeof setter !== "function"
              ? undefined
              : (ev) => {
                  const newValue = setter(ev.target.value as any, data);
                  handleChange?.({ [id]: newValue } as Partial<Data>);
                },
        };

const timeOptions = <Data>(
  place: TimePlace,
  {
    id,
    value,
    handleChange,
    limits,
    valueAsNumber,
    setter,
    ...props
  }: InputOptions<Data>,
): InputAttributes<Data> => ({
  ...props,
  ...getLimit("min", limits?.[place], valueAsNumber),
  ...getLimit("max", limits?.[place], valueAsNumber),
  id: `${id}.${place}`,
  value: value?.[place],
  type: "number",
  onChange: (ev) => {
    handleChange?.((data) => ({
      ...data,
      [id]: {
        ...(data[id] ?? {}),
        [place]: +(ev.target.value || 0),
      },
    }));
  },
});

const getLimit = <Data>(
  key: "min" | "max",
  limits?: InputOptions<Data>["limits"],
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
