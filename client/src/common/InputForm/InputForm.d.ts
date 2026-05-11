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
  /** Providing an object of { value: label } will generate a dropdown.
   *  'custom' will be replaced with the InputForm child element. */
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
  /** This class is also applied to each 'option' element in a dropdown  */
  inputWrapperClass?: string;
  /** Small hint rendered next to the input (e.g. "Recommended: 4"). */
  description?: ReactNode;
};

export type FormButton = {
  key?: string;
  label: string;
  onClick?: MouseEventHandler<HTMLInputElement | HTMLButtonElement>;
  className?: string;
  isSubmit?: boolean;
};

export type BaseData<Data extends Record<string, any>> = {
  defaults?: Readonly<Partial<Data>>;
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

type InnerLimit = Readonly<{ min?: number; max?: number }>;
export type Limit = InnerLimit &
  Readonly<{ array?: InnerLimit; elem?: InnerLimit }>;

export type TimePlace = "hours" | "minutes" | "seconds";
export type Interval = { [key in TimePlace]?: number };
export type TimeLimit = Readonly<{ [key in TimePlace]?: InnerLimit }>;

export type InputAttributes<
  Data,
  Element extends HTMLElement = HTMLInputElement | HTMLSelectElement,
> = InputHTMLAttributes<Element> & {
  options?: Record<string, string>;
  handleChange?: HandleChange<Data>;
};

export type InputOptions<
  Data,
  Element extends HTMLElement = HTMLInputElement | HTMLSelectElement,
> = Omit<InputAttributes<Data, Element>, "type" | "onChange" | "onBlur"> &
  Pick<FormInput<Data>, "type" | "limits"> & {
    handleChange?: HandleChange<Data>;
    setter?: Setter<Data>;
    valueAsNumber?: boolean;
  };

export type InputPropsReturn<
  Data,
  Element extends HTMLElement = HTMLInputElement | HTMLSelectElement,
> =
  | InputAttributes<Data, Element>
  | (InputAttributes<Data, Element> &
      Record<TimePlace, InputAttributes<Data, Element>>);

export type FormElementProps<Data> = {
  inputProps: Omit<InputPropsReturn<Data>, "handleChange">;
  handleChange?: HandleChange<Data>;
  className?: string;
  wrapperClass?: string;
};
