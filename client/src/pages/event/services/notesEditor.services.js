import { useState } from "react";
import { useSyncState, useOnClickOutsideRef } from "../../common/common.hooks";

export default function useTextEditor(
  serverText,
  updateServer,
  { charLimit = 1000 }
) {
  // Setup state (editMode + controlledText)
  const [isEdit, setEdit] = useState(false);
  const [text, setText] = useSyncState(serverText);

  // Truncs text to charLimit & sends to server (only if it's changed)
  const saveText = () => {
    const newText = text.length > charLimit ? text.slice(0, charLimit) : text;
    if (newText !== serverText) updateServer(newText);
    setEdit(false); // Exit editMode
  };

  return {
    // Main state vars
    text,
    isEdit,

    // Saves on click outside of ref element when editing
    ref: useOnClickOutsideRef(saveText, { skip: !isEdit }),

    // Flip between editMode and saving text
    onClick: isEdit ? saveText : () => setEdit(true),

    // Controlled text change handler
    onChange: (ev) =>
      ev.target.value.length > charLimit
        ? setText(ev.target.value.slice(0, charLimit))
        : setText(ev.target.value),
  };
}
