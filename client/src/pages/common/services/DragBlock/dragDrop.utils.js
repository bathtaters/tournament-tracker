import { COMMON_CLS, combineKeys } from "./dragDrop.constants";

// ---- Component Helpers ---- \\

// Return handler if not disabled
export const getHandler = (func, disabled) => disabled ? null : func;
// Get base class names to include in component ClassName
export const getClasses = (classes, className, disabled) =>
  `${classes.static} ${className} ${disabled ? classes.disable : classes.enable}`;


// ---- Handler Helpers ---- \\

// Parse dates recuresively through objs/arrays
const isoDateRe = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?\w/;
const parseDates = obj => {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map(parseDates);
    if (!obj) return obj;
    Object.keys(obj).forEach(k => obj[k] = parseDates(obj[k]));
  } else if (typeof obj === 'string' && isoDateRe.test(obj)) {
    return new Date(obj);
  }
  return obj;
}

// Data extraction helpers
export const getStored = (ev, dataType, ignoreDates=true) => {
  let data = ev.dataTransfer.getData(dataType);
  if (!data) return data;
  data = JSON.parse(data);
  if (!ignoreDates) data = parseDates(data);
  return data;
}
export const getPublicData = (ev, privateDataType) => ev.dataTransfer.types.find(t => !privateDataType || privateDataType !== t);
export const getDataUsing = (getData, args = []) => typeof getData === 'function' ? getData(...args) : getData;

// Class modify helper
export const classMod = (ev, add, rmv) => {
  rmv && rmv.forEach(c => ev.target.classList.remove(c));
  add && add.forEach(c => ev.target.classList.add(c));
}


// ---- Class Helpers ---- \\

// Create a deep copy of obj & inner arrays (depth of 2)
// if OnlyKeys exists, filter to only include these keys
function copyArrObj(obj, onlyKeys) {
  if (!onlyKeys) onlyKeys = Object.keys(obj);
  let copy = {};
  for (const key of onlyKeys) {
    if (!(key in obj)) continue;
    copy[key] = Array.isArray(obj[key]) ? [...obj[key]] : obj[key];
  }
  return copy; 
}

// Append entry (COMMON_CLS) w/ elements common to all 3 'combineKeys'
const compareKeys = combineKeys.slice(1);
export function extractMatches(classes, optimizeClassSwapping) {
  classes[COMMON_CLS] = [];
  if (!optimizeClassSwapping) return classes;

  let indexes, copy = copyArrObj(classes, combineKeys);
  classes[combineKeys[0]] = [];
  
  for (const entry of copy[combineKeys[0]]) {
    
    // Find & record matches from other entries
    indexes = {};
    for (const key of compareKeys) {
      const nextIdx = (copy[key] || []).indexOf(entry); 
      if (nextIdx === -1) break;
      indexes[key] = nextIdx;
    }

    // No matches found
    if (Object.keys(indexes).length !== compareKeys.length)
      classes[combineKeys[0]].push(entry); 
    
    // All entries match
    else {
      classes[COMMON_CLS].push(entry);
      Object.entries(indexes).forEach(([key, idx]) => classes[key].splice(idx,1));
    }
  }

  return classes;
};