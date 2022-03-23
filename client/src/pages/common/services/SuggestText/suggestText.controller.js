import { useEffect, useState, useRef, useMemo, useImperativeHandle } from "react";

import { getSuggestions, autoSelect, autoShow } from "./suggestText.services"
import { getSelected, getNext, getPrev, validList } from "./suggestText.utils"
import { useHotkeys } from "../basic.services";


function useSuggestTextController(list, isHidden, onChange, onSubmit, ref) {
  
  // --- Component State --- \\

  // Setup Local State
  const textbox = useRef(null);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState(-1);
  const [picked, setPick] = useState(null);
  const [listIsVisible, setListVisible] = useState(false);
  
  // Setup List
  const suggestions = useMemo(() => getSuggestions(list, value), [list, value]);
  useEffect(autoSelect(selected, suggestions, setSelected),   [selected, suggestions]);
  useEffect(autoShow(listIsVisible, textbox, setListVisible), [listIsVisible, textbox.current, value]);
  const isExact = !Array.isArray(suggestions) ? suggestions : suggestions.length === 1 ? suggestions[0] : false;


  // --- Action Handlers --- \\

  // TextBox controller
  const change = (e) => {
    setValue(e.target.value); // Controlled component
    
    if (picked && e.target.value !== picked.value) setPick(null); // Clear pick value

    if (onChange) onChange(e); // Passthrough onChange function
  }

  const submit = async (forcePick) => {
    const newPick = forcePick || picked || isExact;

    // Submit
    const result = await (onSubmit && onSubmit(newPick, value));

    // Reset form
    setListVisible(false);
    setPick(null);
    setValue('');
    return newPick && { ...newPick, result };
  }

  const pick = (forcePick) => {
    const newPick = forcePick || isExact || getSelected(selected, suggestions);
    
    if (!newPick) return false; // Ignore missing pick
    if (newPick.isStatic) return submit(newPick); // Submit static pick

    // Pick newPick
    setPick(newPick);
    setValue(newPick.value);
  };

  // Submit or Pick, whichever makes more sense
  const submitOnPicked = () => picked || isExact ? submit() : pick();
  

  // --- Additional Hooks --- \\

  // Allow parent to Submit
  useImperativeHandle(ref, () => ({ submit, getValue: () => !isHidden && (picked, {value}) }));

  // Setup Keyboard UI
  useHotkeys({
    /* Enter */ 13: () => submitOnPicked(),
    /* Esc   */ 27: () => selected === -1 ? textbox.current.blur() : setSelected(-1), // Already cap'd by modal
    /* Up    */ 38: () => setSelected(getPrev(selected, suggestions?.length || 0)), 
    /* Down  */ 40: () => setSelected(getNext(selected, suggestions?.length || 0)),
  });


  return {
    boxProps:  { value, setListVisible, change, ref: textbox },
    listProps: { suggestions, selected, pick, setSelected },
    showList: listIsVisible && validList(suggestions),
  }
}

export default useSuggestTextController;