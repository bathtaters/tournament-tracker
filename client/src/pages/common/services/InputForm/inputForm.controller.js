import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { getDefaultValues, updateDefaults, eraseProps } from "./inputForm.services"

const dotRegex = /\S\.\S/
const submitFilter = (val,key) => val === undefined || dotRegex.test(key)

export default function useFormController({ rows, data, baseData, onSubmit, onEdit, onChange }) {
  // Generate defaultValues
  const defaultValues = useMemo(() => getDefaultValues(rows, baseData?.defaults), []) // Must guarantee that rows/baseData doesn't change

  // Hooks
  const { register, formState: { errors, isDirty }, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: updateDefaults(defaultValues, data),
    shouldUseNativeValidation: true,
  })
  
  // First edit handler
  useEffect(() => { if (onEdit && isDirty) onEdit() }, [isDirty])

  // Submit handler
  const submitController = useCallback(handleSubmit(
    (data, ev) => onSubmit(eraseProps(data, submitFilter), ev),
    console.error
  ), [onSubmit, handleSubmit])

  return {
    handleChange: onChange,
    handleSubmit: submitController,
    backend: { register, errors, set: setValue, get: getValues },
  }
}