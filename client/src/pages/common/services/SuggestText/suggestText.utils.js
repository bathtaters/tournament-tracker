// Get data from entries
export const getId  = (entry) => entry?.id || '#' + (entry.value || 'NONE');

// Determine if list is valid
export const validList = (list) => Array.isArray(list) && Boolean(list.length);

// Hotkey Handlers
export const getNext = (curr, total) => curr + 1 >= total || curr < 0 ? 0 : curr + 1;
export const getPrev = (curr, total) => curr <= 0 || curr > total ? total - 1 : curr - 1;

// Get value of selection based off index
export const getSelected = (selected, suggestions) => {
  if (selected < 0) {
    if (suggestions.length === 1) return suggestions[0];
    return;
  }
  return selected < suggestions.length && suggestions[selected];
};

export const getNonStaticSolo = (list) => {
  const nonStatic = list.filter(entry => !entry.isStatic)
  return nonStatic.length === 1 && nonStatic[0]
}

export const getNonStaticSoloIdx = (list) => {
  let nonStatic = []
  list.forEach((entry,idx) => !entry.isStatic && nonStatic.push(idx))
  return nonStatic.length === 1 ? nonStatic[0] : -1
}