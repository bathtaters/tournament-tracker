import { validList } from "./suggestText.utils";

// Advanced Settings
const hideListWhenEmpty = false;
const hideStaticWhenEmpty = true;


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
  else if ((selected < 0 || selected >= list.length)) setSelected(0); // select 1st entry if out of bounds
};


// Auto-select rules (Runs on list change)
export const autoShow = (listIsVisible, textbox, setListVisible) => () => {
  if (!listIsVisible && document.activeElement === textbox.current) setListVisible(true);
};