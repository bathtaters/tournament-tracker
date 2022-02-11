// Returns properties from 'base' that are changed from 'compare'
const getUnqiue = (base, compare = {}) => Object.keys(base).reduce((obj,key) => {
  if (base[key] !== compare[key]) obj[key] = base[key]
  return obj
}, {})

// Transform settingsObject and update
export const updateController = (newData, oldData, updater) => {
  const newSettings = getUnqiue(newData, oldData);
  if (typeof newSettings !== 'object' || !Object.keys(newSettings).length) return;
  updater(newSettings);
}

// Runs array.filter on nested arrays (Only calls predicate on non-array elements)
export const deepFilter = (array, predicate) => array.reduce((res,elem,idx) => {
  if (Array.isArray(elem)) res.push(deepFilter(elem, predicate))
  else if (predicate(elem,idx,array)) res.push(elem)
  return res
}, [])