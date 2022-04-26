import { COMMON_CLS, combineKeys } from "./dragDrop.constants";

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
      const nextIdx = (classes[key] || []).indexOf(entry); 
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