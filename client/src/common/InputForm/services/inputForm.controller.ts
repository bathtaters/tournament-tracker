import type { BaseData, FormLayout, HandleChange } from "../InputForm.d";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getDefaultValues,
  getSetters,
  resolveDotNotation,
  submitTransform,
} from "./inputForm.services";

/**
 * Controller for InputForm component.
 * @param [rows] - Layout object (Nested layouts alternate between columns/rows)
 * @param [data] - Current values of data
 * @param [baseData] - Type definitions (from Validation.json, defaults/limits/etc)
 * @param onSubmit - `({ ...formData }) => void` - Function run when form is submitted
 * @param [onEdit] - `() => void` - Function run the first time a form is edited
 * @param [onChange] - `({ ...changedData }) => void` - Function run every time any value in the form changes
 * @param [isLoaded] - Reset form whenever this changes
 */
export type UseFormProps<T extends Record<string, any>> = {
  rows?: FormLayout<T>;
  data?: T;
  baseData?: BaseData<T>;
  onSubmit: (data: T) => void;
  onEdit?: () => void;
  onChange?: (update: Partial<T>) => void;
  isLoaded?: boolean;
};

/**
 * Controller for InputForm component.
 * - `rows`: Layout object
 * - `data`: Current values of data
 * - `baseData`: 'Defaults' from type definitions (Validation.json)
 * - `onSubmit: ({ ...formData }) => void`: Function run when form is submitted
 * - `onEdit?: () => void`: Function run the first time a form is edited
 * - `onChange?: ({ ...changedData }) => void`: Function run every time any value in the form changes
 * - `isLoaded?: bool`: Reset form whenever this changes
 */
export default function useFormController<Data extends Record<string, any>>({
  rows,
  data,
  baseData,
  onSubmit,
  onEdit,
  onChange,
  isLoaded,
}: UseFormProps<Data>) {
  // Generate static defaultValues & setters objects
  const defaultValues = useMemo(
    () => getDefaultValues(rows, baseData?.defaults),
    [rows, baseData?.defaults],
  );
  const setters = useMemo(() => getSetters(rows), [rows]);

  const [isChanged, setChanged] = useState(false);
  const [values, updateValues] = useState(defaultValues);

  const handleChange: HandleChange<Data> = useCallback(
    (update) => {
      // Handle the first update
      if (!isChanged) {
        setChanged(true);
        onEdit?.();
      }

      // Update value
      updateValues((vals) => {
        vals =
          typeof update === "function" ? update(vals) : { ...vals, ...update };
        onChange?.(vals);
        return vals;
      });
    },
    [isChanged, onChange, onEdit],
  );

  const resetValues = useCallback(
    (baseData?: Data) => {
      updateValues(
        baseData ?? (data ? { ...defaultValues, ...data } : defaultValues),
      );
      setChanged(false);
    },
    [defaultValues, data],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (ev) => {
      ev.preventDefault();
      const newData = resolveDotNotation<Data>(
        submitTransform(values, setters),
      );
      onSubmit(newData);
      resetValues(newData);
    },
    [values, onSubmit, resetValues, setters],
  );

  useEffect(() => {
    if (isLoaded) resetValues();
    // eslint-disable-next-line -- Reset form when data becomes loaded
  }, [isLoaded]);

  return { values, setters, handleChange, handleSubmit };
}
