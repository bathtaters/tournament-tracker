import { useState } from "react";
import { useOpenAlert } from "../../General/common.hooks";
import { duplicateItemAlert } from "../../../assets/alerts";

export default function useEditableListController({
  type,
  value,
  onChange,
  query,
  idKey,
  displayValue,
  filter,
  autofill,
  isLocked,
  onFirstChange,
}) {
  // Get Global State
  const { data, isLoading, error } = query;

  // Init Local State
  const openAlert = useOpenAlert();

  const getDisplay =
    typeof displayValue === "function"
      ? displayValue
      : (val, data) => data?.[val]?.[displayValue] || val;

  // Add item to list
  const pushItem = async (id) => {
    if (!id) throw new Error(`Added ${type} is missing id!`);
    if (!value) value = [];

    if (value.includes(id)) {
      await openAlert(duplicateItemAlert(type, getDisplay(id, data)));
      return false;
    }

    onChange(value.concat(id));
    return true;
  };

  // Remove item from list
  const popItem = (id, idx) => () => {
    const rmvIdx = value[idx] === id ? idx : value.lastIndexOf(id);
    rmvIdx in value &&
      onChange([...value.slice(0, rmvIdx), ...value.slice(rmvIdx + 1)]);
  };

  // Run onFirstChange once, when first edit is made
  const [isChanged, setChanged] = useState(!onFirstChange);
  const onFirstEdit = isChanged
    ? null
    : () => {
        onFirstChange();
        setChanged(true);
      };

  // Break early while awaiting global data
  if (isLoading || error || !data)
    return { isLoading: isLoading, error: error };

  // Passed to ListInput
  if (!isLocked && value?.length) autofill.hidden = true;
  const inputData = isLocked
    ? { getDisplay }
    : {
        data,
        pushItem,
        onFirstEdit,
        idKey,
        getDisplay,
        autofill,
        // Get list of items that are not already selected
        remaining: data
          ? Object.keys(data).filter(
              (id) => !value?.includes(id) && (!filter || filter(data[id], id)),
            )
          : [],
      };

  // Pass to renderer
  return { data, inputData, popItem };
}
