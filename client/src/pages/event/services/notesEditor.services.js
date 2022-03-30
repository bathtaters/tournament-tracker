import { useEffect, useState } from "react"
import { usePropState, useOnClickOutsideRef } from "../../common/common.hooks"

export default function useTextEditor(serverText, updateServer, { charLimit = 1000, saveOnDismount = true }) {
  // Setup state (editMode + controlledText)
  const [ isEdit, setEdit ] = useState(false)
  const [ text,   setText ] = usePropState(serverText, (s,p) => p && s === p)

  // Truncs text to charLimit & sends to server (only if it's changed)
  const saveText = async () => {
    const saveText = text.length > charLimit ? text.slice(0, charLimit) : text
    if (saveText !== serverText) updateServer(saveText)
    setEdit(false) // Exit editMode
  }

  // Save on leave page
  useEffect(() => saveOnDismount && isEdit ? saveText : null, [])
  
  return {
    // Main state vars
    text, isEdit,

    // Saves on click outside of ref element when editing
    ref: useOnClickOutsideRef(saveText, { skip: !isEdit }),
  
    // Flip between editMode and saving text
    onClick: isEdit ? saveText : () => setEdit(true),
  
    // Controlled text change handler
    onChange: (ev) => ev.target.value.length > charLimit ? setText(ev.target.value.slice(0,charLimit)) : setText(ev.target.value),

  }
}