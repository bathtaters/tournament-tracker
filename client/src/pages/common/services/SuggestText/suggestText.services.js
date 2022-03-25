import { useState } from "react";
import { validList, getNonStaticSoloIdx } from "./suggestText.utils";
import { suggestText } from "../../../../assets/config";
const { hideListWhenEmpty, hideStaticWhenEmpty } = suggestText;

// Filter Suggestions logic
export function getSuggestions(list, value) {
  // Setup registers/constants
  const len = value.length;
  if (hideListWhenEmpty && !len) return { suggestions: [] }; // Hide all when text box is empty 

  const lower = value.toLowerCase();
  let exact = false;
  
  // Filter list
  let matches = list.filter(entry => {
    if (entry.isStatic) return !hideStaticWhenEmpty || len; // Static entry filter

    const entryLower = entry.value?.toLowerCase() || console.warn('List item is invalid',entry);
    
    if (entryLower === lower) exact = entry; // get exact matches
    return !exact &&
      entryLower.slice(0,len) === lower; // Quicker
      // entryLower.indexOf(lower) > -1; // More flexible
  });

  return exact || matches;
}


// Auto-select rules (Runs on list change)
export const autoSelect = (selected, list, setSelected) => () => {
  if (!validList(list)) setSelected(-1); // deselect when no list
  else if ((selected < -2 || selected >= list.length)) setSelected(0); // select 1st entry if out of bounds
  else if (selected === -1) setSelected(getNonStaticSoloIdx(list))
};


// Auto-select rules (Runs on list change)
export const autoShow = (listIsVisible, isFocused, setListVisible) => () => {
  if (!listIsVisible && isFocused) setListVisible(true);
};


// Auto-select list item on mouse hover 
export const useSetOnHover = (setter) => {
  const [ lastCoords, setLastCoords ] = useState([]);

  return (id) => (ev) => {
    // Ignores if no mouse movement (Fixes unwanted triggers while scrolling)
    if (lastCoords[0] !== ev.screenX || lastCoords[1] !== ev.screenY) setter(id)

    setLastCoords([ev.screenX, ev.screenY])
  }
}