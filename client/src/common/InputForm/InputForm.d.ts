import type {
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

export type Setter<
  Data extends Record<string, any>,
  T extends Data[keyof Data] = Data[keyof Data],
> = (value: T, data: Data) => ReactNode;

export type HandleChange<Data extends Record<string, any>> = (
  update: Partial<Data> | ((current: Data) => Data),
) => void;

export type FormInput<
  Data extends Record<string, any>,
  T extends Data[keyof Data] = Data[keyof Data],
> = {
  id: string;
  label?: string;
  type?: HTMLInputTypeAttribute | "custom" | "spacer" | Record<string, string>;
  defaultValue?: ReactNode;
  setValueAs?: Setter<Data, T>;
  limits?: Limit | TimeLimit;
  min?: number | ((data: Data) => number);
  max?: number | ((data: Data) => number);
  disabled?: boolean | ((data: Data) => boolean);
  hidden?: boolean | ((data: Data) => boolean);
  isFragment?: boolean;
  required?: boolean;
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

export type Setters<Data> = {
  [ID in keyof Data]?: Setter<Data, Data[ID]>;
};

export type FormLayout<Data extends Record<string, any>> =
  | FormInput<Data>
  | "custom"
  | "spacer"
  | ReactElement
  | null
  | FormLayout<Data>[];

// Backend types

export type TimePlace = "hours" | "minutes" | "seconds";
export type Interval = { [key in TimePlace]?: number };
export type Limit = { min?: number; max?: number };
export type TimeLimit = { [key in TimePlace]?: Limit };

export type InputAttributes<Data> = InputHTMLAttributes<HTMLInputElement> & {
  options?: Record<string, string>;
  handleChange?: HandleChange<Data>;
};

export type InputOptions<Data> = Omit<
  InputAttributes<Data>,
  "type" | "onChange" | "onBlur"
> &
  Pick<FormInput<Data>, "type" | "limits"> & {
    handleChange?: HandleChange<Data>;
    setter?: Setter<Data>;
    valueAsNumber?: boolean;
  };

export type InputPropsReturn<Data> =
  | InputAttributes<Data>
  | (InputAttributes<Data> & Record<TimePlace, InputAttributes<Data>>);

export type FormElementProps<Data> = {
  inputProps: InputPropsReturn<Data>;
  className?: string;
  wrapperClass?: string;
};
