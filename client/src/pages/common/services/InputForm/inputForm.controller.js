import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDefaultValues,
  getSetters,
  submitTransform,
  resolveDotNotation,
} from "./inputForm.services";

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
export default function useFormController({
  rows,
  data,
  baseData,
  onSubmit,
  onEdit,
  onChange,
  isLoaded,
}) {
  // Generate static defaultValues & setters objects
  const defaultValues = useMemo(
    () => getDefaultValues(rows, baseData?.defaults),
    [rows, baseData?.defaults]
  );
  const setters = useMemo(() => getSetters(rows), [rows]);

  const [isChanged, setChanged] = useState(false);
  const [values, udpateValues] = useState(defaultValues);

  const updateValue = useMemo(
    () =>
      isChanged
        ? // Standard method
          (id, value) => {
            udpateValues((vals) => ({
              ...vals,
              [id]: typeof value === "function" ? value(vals[id]) : value,
            }));
            onChange?.({ [id]: value });
            // First-change method
          }
        : (id, value) => {
            setChanged(true);
            udpateValues((vals) => ({
              ...vals,
              [id]: typeof value === "function" ? value(vals[id]) : value,
            }));
            onChange?.({ [id]: value });
            onEdit?.();
          },
    [isChanged, onChange, onEdit]
  );

  const handleChange = useCallback(
    (id, eventOrSetter) =>
      updateValue(
        id,
        typeof eventOrSetter === "function"
          ? eventOrSetter
          : eventOrSetter.target.type === "checkbox"
          ? eventOrSetter.target.checked
          : eventOrSetter.target.value
      ),
    [updateValue]
  );

  const resetValues = useCallback(() => {
    udpateValues({ ...defaultValues, ...data });
    onChange?.({});
    setChanged(false);
  }, [defaultValues, data, onChange]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const newData = resolveDotNotation(submitTransform(values, setters));
      onSubmit(newData);
      resetValues();
    },
    [values, onSubmit, resetValues, setters]
  );

  useEffect(() => {
    if (isLoaded) resetValues();
    // eslint-disable-next-line -- Reset form when data becomes loaded
  }, [isLoaded]);

  return { values, setters, handleChange, handleSubmit };
}
