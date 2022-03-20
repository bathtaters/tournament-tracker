import { useEffect, useCallback, useRef } from "react";

// Checks that 2 arrays are equal (Must be 1D arrays, 2 falsy vars will also be equal)
export const equalArrays = (a,b) =>
  (!a && !b) || (a && b && 
    a.length === b.length && 
    a.every((v,i) => b[i] === v)
  );

// Generates a temporary ID
const TEMP_ID_PREFIX = 'TEMPID'
export const isTempId = id => id.slice(0,TEMP_ID_PREFIX.length) === TEMP_ID_PREFIX; 
const tempId = type => n => `${TEMP_ID_PREFIX}-${type}-${('0000'+n).slice(-4)}`;
export const nextTempId = (type, exists) => {
  if (!exists) return tempId(type)(0);
  let n = 0, id; const getId = tempId(type);
  while (++n < 10000) { 
    id = getId(n);
    if (!exists.includes(id)) break;
  } return id;
}


// Listen & handle hotkeys
// hotkeyMap = { [keyCode]: () => action(), ... }
export function useHotkeys(hotkeyMap, { skip, deps } = {}) {
  const hotkeyHandler = useCallback((ev) => {
    // console.debug(' >> KeyCode: ',ev.keyCode); // print keycodes

    if (!hotkeyMap[ev.keyCode]) return;
    ev.preventDefault();

    if (typeof hotkeyMap[ev.keyCode] === 'function') hotkeyMap[ev.keyCode](ev);
    else console.error('Malformed keyMap for', ev.keyCode, hotkeyMap[ev.keyCode]);

  }, deps);

  useEffect(() => {
    if (!skip) document.addEventListener('keydown', hotkeyHandler, false);
    else document.removeEventListener('keydown', hotkeyHandler, false);

    return () => document.removeEventListener('keydown', hotkeyHandler, false);

  }, deps && deps.concat(skip));
}


// Provides a ref to give to an object you want to be scrolled to if invisible
//    options = see IntersectionObserver options & ScrollIntoView options
export function useScrollToRef({
  // Observer options
  rootRef = null, threshold = 1.0, rootMargin = "0px",
  // ScrollIntoView options
  behavior = "auto", block = "start", inline = "nearest", 
} = {}) {
  // Create scroll callback
  const elementRef = useRef(null)
  const scrollTo = (entries) => {
    if (!entries[0].isIntersection)
      elementRef.current.scrollIntoView({ behavior, block, inline })
  }

  // Add/Remove observer listener
  useEffect(() => {
    const root = rootRef && 'current' in rootRef ? rootRef.current : rootRef

    const observer = new IntersectionObserver(scrollTo, {root, threshold, rootMargin})
    if (elementRef.current) observer.observe(elementRef.current)

    return () => { if (elementRef.current) observer.unobserve(elementRef.current) }
  }, [elementRef.current, rootRef, threshold, rootMargin])

  // Get reference to element
  return elementRef
}