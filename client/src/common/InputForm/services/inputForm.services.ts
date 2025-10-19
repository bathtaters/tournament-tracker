import type {
  FormInput,
  FormLayout,
  HandleChange,
  InputAttributes,
  Setters,
} from "../InputForm.d";
import { isValidElement } from "react";

/** Convert any value to Number, returns NULL if not possible.  */
export const toNum = (value: any): number | null => {
  if (typeof value !== "number") {
    if (value == null) return null;
    value = Number(value);
  }
  return Number.isNaN(value) ? null : Number(value);
};

/** Split out non HTML values from InputAttributes */
export const splitAttributes = <Data extends Record<string, any>>(
  { placeholder, options, ...attributes }: InputAttributes<Data>,
  handleChange: HandleChange<Data>,
) =>
  attributes.type === "select"
    ? { attributes, placeholder, handleChange, options }
    : { attributes: { placeholder, ...attributes }, handleChange };

export const fixSelectAttribs = <T extends Record<string, any>>({
  value,
  ...attributes
}: T): Omit<T, "value"> & { value: string } => ({
  ...attributes,
  value: typeof value === "number" ? value : value || " ",
});

/** Collect all default values */
export const getDefaultValues = <T>(
  rows: FormLayout<T>,
  defaults?: Partial<T>,
) =>
  flatReduce(rows, ({ id, defaultValue }: FormInput<T>, defs: Partial<T>) => {
    if (id) defs[id] = defaultValue ?? defaults?.[id] ?? "";
  });

/** Collect all setValueAs functions */
export const getSetters = <T>(rows: FormLayout<T>) =>
  flatReduce(
    rows,
    ({ id, setValueAs }: FormInput<T>, setters: Partial<Setters<T>>) => {
      if (id && typeof setValueAs === "function") setters[id] = setValueAs;
    },
  );

/** Remove empty fields and apply setValueAs functions */
export const submitTransform = <T>(data: T, setters: Setters<T>) => {
  const result = {} as any;
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = setters[key] ? setters[key](data[key], data) : data[key];
    }
  }
  return result as T;
};

/**  Convert dot notation to nested JSON */
export function resolveDotNotation<T extends Record<string, any>>(obj: any): T {
  const result = {};

  for (const key in obj) {
    const parts = key.split(".");
    let current = result;

    // Walk down path
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        // Add object for alpha key, array for numeric key
        current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      current = current[part];
    }

    // Assign value
    current[parts[parts.length - 1]] = obj[key];
  }

  return result as T;
}

/** Get key for row map */
export const getRowKey = <T>(
  row: FormLayout<T>,
  i: number,
  keySuffix: string,
) => {
  if (!row) return `Null${keySuffix}:${i}`;
  if (isValidElement(row)) return `Elem${keySuffix}:${i}`;
  if (Array.isArray(row)) return `Wrapper${keySuffix}:${i}`;
  if (row === "custom") return `Custom${keySuffix}:${i}`;
  if (row === "spacer") return `Spacer${keySuffix}:${i}`;
  return row.id || `${row.label || row.type || "Key"}${keySuffix}:${i}`;
};

/** array.reduce for a nested array (Like array.flatMap is to array.map) */
const flatReduce = <Out, In>(
  nestedArray: any,
  callback: (val: In, initial: Partial<Out>) => void,
  initialValue: Partial<Out> = {},
) => {
  if (Array.isArray(nestedArray))
    nestedArray.forEach((next) => flatReduce(next, callback, initialValue));
  else callback(nestedArray, initialValue);
  return initialValue as Out;
};
