// Get data from entries
const suggestionKey = 'name', uniqueKey = 'id';
export const getId  = (entry, stringPrefix) => entry[uniqueKey] || (stringPrefix ? stringPrefix + entry : undefined);
export const getVal = (entry) => entry[suggestionKey] || entry;


// Get value of selection based off index
export const getSelected = (selected, suggestions, staticList) => {
  if (selected < 0) {
    if (!suggestions.length &&  staticList.length === 1) return staticList[0];
    if (!staticList.length  && suggestions.length === 1) return suggestions[0];
    return;
  }
  return selected < suggestions.length ? suggestions[selected] : staticList[selected - suggestions.length];
};


// Auto-select rules (Runs on list change)
export const autoSelect = (selected, listCount, oneMatch, setSelected) => () => {
  if ((selected < 0 || selected >= listCount) && oneMatch) setSelected(0); // select 1st
  else if (selected >= listCount) setSelected(-1); // select none
};


// Hotkey Handlers
export const getNext = (curr, total) => curr + 1 >= total || curr < 0 ? 0 : curr + 1;
export const getPrev = (curr, total) => curr <= 0 || curr > total ? total - 1 : curr - 1;
export const enterHandler = (isSolo, onEnter, choose) => {
  if (isSolo && onEnter) return onEnter(isSolo);
  return choose();
};