import { useEffect, useCallback, useState } from "react";

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

// Generates 'onClick' events for mouse & touch screen (usage: <Tag {...onClickAll(cb)} /> )
export const onClickAll = (callback) => ({ onMouseDown: callback, onTouchStart: callback })

// Listen & handle hotkeys
// hotkeyMap = { [keyCode]: () => action(), ... } !! MUST BE STATIC
export function useHotkeys(hotkeyMap, { skip, deps } = {}) {
  const hotkeyHandler = useCallback((ev) => {
    // console.debug(' >> KeyCode: ',ev.keyCode); // print keycodes

    if (!hotkeyMap[ev.keyCode]) return;
    ev.preventDefault();

    if (typeof hotkeyMap[ev.keyCode] === 'function') hotkeyMap[ev.keyCode](ev);
    else console.error('Malformed keyMap for', ev.keyCode, hotkeyMap[ev.keyCode]);
  // eslint-disable-next-line
  }, deps);

  useEffect(() => {
    if (!skip) document.addEventListener('keydown', hotkeyHandler, false);
    else document.removeEventListener('keydown', hotkeyHandler, false);

    return () => document.removeEventListener('keydown', hotkeyHandler, false);
  // eslint-disable-next-line
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
  const [ elementRef, setRef ] = useState(null)

  // Add/Remove observer listener
  useEffect(() => {
    const root = rootRef && 'current' in rootRef ? rootRef.current : rootRef

    const observer = new IntersectionObserver((entries) => {
      if (elementRef && !entries[0].isIntersection)
        elementRef.scrollIntoView({ behavior, block, inline })
    }, {root, threshold, rootMargin})

    if (elementRef) observer.observe(elementRef)

    return () => { if (elementRef) observer.unobserve(elementRef) }
  }, [elementRef, rootRef, threshold, rootMargin, behavior, block, inline])

  // Get reference to element
  return (newRef) => setRef(newRef)
}