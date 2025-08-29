import type {
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

export type FormInput<Data extends Record<string, any>> = {
  id: string;
  label?: string;
  type: HTMLInputTypeAttribute | "custom" | "spacer";
  data?: Data;
  defaultValue?: ReactNode;
  setValueAs?: (value: Data[keyof Data], data?: Data) => ReactNode;
  limits?: Limit | TimeLimit;
  min?: number | ((data: Data) => number);
  max?: number | ((data: Data) => number);
  onChange?: (
    id: str,
    value: Data[keyof Data] | (<T extends Data[keyof Data]>(current: T) => T),
  ) => any;
  onBlur?: (value: any, data: Data) => any;
  disabled?: boolean | ((data: Data) => boolean);
  required?: boolean;
  isFragment?: boolean;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  inputWrapperClass?: string;
};

export type FormButton = {
  key?: string;
  label: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  className?: string;
  isSubmit?: boolean;
};

export type BaseData<Data extends Record<string, any>> = {
  defaults?: Partial<Data>;
  limits?: { [key in keyof Data]?: Limit | TimeLimit };
};

export type FormLayout<Data extends Record<string, any>> = Array<
  | FormInput<Data>
  | FormInput<Data>["type"]
  | ReactElement
  | null
  | FormLayout<Data>
>;

// Backend types

export type TimePlace = "hours" | "minutes" | "seconds";
export type Interval = { [key in TimePlace]?: number };
export type Limit = { min?: number; max?: number };
export type TimeLimit = { [key in TimePlace]?: Limit };

export type InputAttributes = InputHTMLAttributes<HTMLInputElement>;

export type InputOptions = Omit<Attributes, "onChange" | "onBlur"> &
  Pick<FormInput<any>, "onChange" | "onBlur" | "limits"> & {
    valueAsNumber?: boolean;
  };
