import { useState } from "react";
import { useSuggestText } from "../../SuggestText/SuggestText";
import { suggestListLayout } from "../styles/EditableListStyles";
import { debugLogging } from "../../../assets/config";

export default function useListInputController({
  data,
  idKey,
  displayKey,
  remaining,
  onFirstEdit,
  pushItem,
  create,
}) {
  // Setup state
  const [isHidden, setHide] = useState(true);

  // Add new item
  const handleNewItem = async (name) => {
    if (!create?.mutation) return false;
    const result = await create.mutation(name);
    return result && typeof result === "object" && pushItem(result[idKey]);
  };

  // Click add button
  const submitHandler = (text, entry) => {
    // Show/Hide field
    if (isHidden) return setHide(false);
    if (!entry) return setHide(!isHidden);

    // Call onFirstEdit
    if (onFirstEdit && !entry.isStatic) onFirstEdit();

    // Add item to list
    if (entry[idKey]) return pushItem(entry[idKey]);
    if (!entry.isStatic && debugLogging)
      console.warn("Missing item created automatically", entry);
    return handleNewItem(text);
  };

  // SuggestText controller
  const { backend, submit } = useSuggestText(
    suggestListLayout(remaining, data, displayKey, create),
    {
      isHidden,
      onSubmit: submitHandler,
      hideStaticWhenEmpty: create.hideOnEmpty,
    },
  );

  return {
    backend,
    isHidden,

    // Add Button handler
    addButtonHandler: () => {
      onFirstEdit && onFirstEdit();
      return isHidden ? setHide(false) : submit();
    },
  };
}
