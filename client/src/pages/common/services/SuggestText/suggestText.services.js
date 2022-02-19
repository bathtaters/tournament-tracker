import { getId, getVal } from "./suggestText.utils";


// Filter Suggestions logic
export const getSuggestions = (list, value) => {
  // Setup registers/constants
  const len = value.length;
  // if (!len) return { suggestions: [], isSolo: false }; // Hide all when text box is empty 
  const lower = value.toLowerCase();
  let exact = false;
  
  // Filter list
  const matches = list.filter(entry => {
    const entryLower = getVal(entry).toLowerCase();
    
    if (entryLower === lower) exact = entry;
    return !exact &&
      entryLower.slice(0,len) === lower; // Quicker
      // entryLower.indexOf(lower) > -1; // More flexible
  });

  return { suggestions: matches, isSolo: !matches.length && exact };
};


// Choose List Item logic
export const chooseController = (getCurrent, chooseStatic, onChange, setSelected) => (select) => {
  // Get selected value
  if (!select) select = getCurrent();
  if (!select) return setSelected(-1);

  // Set to static value
  if (typeof select === 'string' && chooseStatic)
    return chooseStatic(select) || setSelected(-1);

  // Set to suggestion
  onChange({ target: {
    id: getId(select),
    value: getVal(select),
  }});
  setSelected(-1);
};