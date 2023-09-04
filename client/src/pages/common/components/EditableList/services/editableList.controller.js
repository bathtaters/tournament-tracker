import { useState, useRef } from "react"
import { useOpenAlert } from "../../../common.hooks"
import { duplicateItemAlert } from "../../../../../assets/alerts"

export default function useEditableListController({ type, value, onChange, query, idKey, nameKey, autofill, isLocked, onFirstChange }) {

  // Get Global State
  const { data, isLoading, error } = query
  
  // Init Local State
  const suggestRef = useRef(null)
  const openAlert = useOpenAlert()

  // Add item to list
  const pushItem = async (id) => {
    if (!id) throw new Error(`Added ${type} is missing id!`)
    if (!value) value = []

    if (value.includes(id)) {
      await openAlert(duplicateItemAlert(type, data[id]?.[nameKey]))
      return false
    }
    
    onChange(value.concat(id))
    return true
  }
  
  // Remove item from list
  const popItem = (id, idx) => () => {
    const rmvIdx = value[idx] === id ? idx : value.lastIndexOf(id)
    rmvIdx in value && onChange([ ...value.slice(0, rmvIdx), ...value.slice(rmvIdx + 1) ])
  }
  
  // Run onFirstChange once, when first edit is made
  const [ isChanged, setChanged ] = useState(!onFirstChange)
  const onFirstEdit = isChanged ? null : () => { onFirstChange(); setChanged(true) }

  // Break early while awaiting global data
  if (isLoading || error || !data) return { isLoading: isLoading, error: error }

  // Passed to ListInput
  if (!isLocked && value?.length) autofill.hidden = true
  const inputData = isLocked ? {} : {
    data,
    pushItem,
    onFirstEdit,
    idKey,
    nameKey,
    autofill,
    // Get list of itemes that are not already selected
    remaining: data ? Object.keys(data).filter((id) => !value?.includes(id)) : [],
  }

  // Pass to renderer
  return { data, inputData, suggestRef, popItem }
}