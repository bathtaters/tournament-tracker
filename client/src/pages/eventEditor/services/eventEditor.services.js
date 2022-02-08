import { useRef, useEffect } from "react";
import { equalArrays, nextTempId } from "../../common/services/basic.services";

// For local render of playerList
export const emptyNewPlayer = { visible: false, name: "", id: null };

// Save history of 1D array
export function usePreviousArray(newValue) {
  const prevRef = useRef([]);
  useEffect(() => { 
    if (newValue && !equalArrays(prevRef.current, newValue))
      prevRef.current = newValue;
  }, [newValue]);
  return prevRef.current || [];
}

// Apply only new changes to existing cache (For concurrent write-while-editing)
export function updateArrayWithChanges(before, after, arrToChange) {
  let result = [...arrToChange];
  before.forEach(v => { 
    if (!after.includes(v)) {
      const idx = result.indexOf(v);
      if (idx !== -1) result.splice(idx,1);
    } 
  });
  after.forEach((v,i) => { 
    if (!before.includes(v)) result.splice(i,0,v);
  });
  return result || [];
}

// Radomizes an array, optionally trimming it to a specific size
export const randomArray = (arr, size) => {
  if (typeof size !== 'number' || size > arr.length) size = arr.length;
  let res = [], rem = arr.slice();
  for (let i = 0; i < size; i++) {
    res.push(rem.splice(Math.floor(Math.random()*rem.length), 1)[0]);
  }
  return res;
};

export { equalArrays, nextTempId };