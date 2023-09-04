import { useState } from "react"
import { suggestListLayout } from "../styles/EditableListStyles"
import { debugLogging } from "../../../../../assets/config"


export default function useListInputController({ data, idKey, nameKey, remaining, onFirstEdit, pushItem, create }, ref) {
  // Setup state
  const [isHidden, setHide] = useState(true)

  // Add new item
  const handleNewItem = async (name) => {
    if (!create?.mutation) return false
    const result = await create.mutation(name)
    return result && pushItem(result[idKey])
  }

  // Click add button
  const submitHandler = (text, entry) => {
    // Show/Hide field
    if (isHidden) return setHide(false)
    if (!entry) return setHide(!isHidden)

    // Call onFirstEdit
    if (onFirstEdit && !entry.isStatic) onFirstEdit()

    // Add item to list
    if (entry[idKey]) return pushItem(entry[idKey])
    if (!entry.isStatic && debugLogging) console.warn('Missing item created automatically', entry)
    return handleNewItem(text)
  }

  return {
    isHidden, submitHandler,

    // Build list
    suggestions: suggestListLayout(remaining, data, nameKey, create),

    // Add Button handler
    addButtonHandler: () => {
      onFirstEdit && onFirstEdit();
      return isHidden ? setHide(false) : ref.current.submit();
    },
  }
}