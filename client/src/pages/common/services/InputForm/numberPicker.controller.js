import { useMemo } from "react"

// NumberPicker controller
const useNumberPicker = ({ id, min, max }, { get, set }) => useMemo(() => ({

  decHandler: () => {
    const val = get(id)
    if (val === min) return;
    if      (typeof min === 'number' && val < min) set(id, min, { shouldValidate: true, shouldDirty: true })
    else if (typeof max === 'number' && val > max) set(id, max, { shouldValidate: true, shouldDirty: true })
    else set(id, val - 1, { shouldValidate: true, shouldDirty: true })
  },

  incHandler: () => {
    const val = get(id)
    if (val === max) return;
    if      (typeof max === 'number' && val > max) set(id, max, { shouldValidate: true, shouldDirty: true })
    else if (typeof min === 'number' && val < min) set(id, min, { shouldValidate: true, shouldDirty: true })
    else set(id, val + 1, { shouldValidate: true, shouldDirty: true })
  }

}), [id, min, max, set, get])

export default useNumberPicker