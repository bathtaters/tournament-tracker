import { useEffect, useCallback, useState, useRef } from "react";
import { debugLogging } from "../../../assets/config";

/** Test to values for equality, works for arrays/objects but not functions */
export function deepEquals(val1, val2) {
  if (val1 === val2) return true

  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false
    return val1.every((item, index) => deepEquals(item, val2[index]))
  }

  if (typeof val1 === 'object' && typeof val2 === 'object' && val1 && val2) {
    const keys = Object.keys(val1)
    if (keys.length !== Object.keys(val2).length) return false
    return keys.every((key) => deepEquals(val1[key], val2[key]))
  }

  return false
}

// ---- Temporary IDs ---- \\
const TEMP_ID_PREFIX = 'TEMPID'
const tempId = (type) => (n) => `${TEMP_ID_PREFIX}-${type}-${('0000'+n).slice(-4)}`;

/** Check if ID is temporary */
export const isTempId = (id) => id.slice(0,TEMP_ID_PREFIX.length) === TEMP_ID_PREFIX; 

/** Generate a temporary ID */
export const nextTempId = (type, exists) => {
  if (!exists) return tempId(type)(0);
  let n = 0, id; const getId = tempId(type);
  while (++n < 10000) { 
    id = getId(n);
    if (!exists.includes(id)) break;
  } return id;
}

/** Gets an event with the value replaced. */
export const eventWithValue = (event, value, isCheckbox = false) => ({
  ...event,
  target: {
    ...event.target,
    [isCheckbox ? 'checked' : 'value']: value
  }
})

/** Generates 'onClick' events for mouse & touch screen:
 *  ```jsx
 *   <div {...onClickAll(cb)} />
 *  ```*/
export const onClickAll = (callback) => ({ onMouseDown: callback, onTouchStart: callback })

/** Simple SHA-256 hash of text. Returns null if input is falsy. */
export const hashText = (text) => !text ? Promise.resolve(null) :
    window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(text))
        .then((z) =>
          Array.from(new Uint8Array(z))
            .map((d) => d.toString(16).padStart(2, "0"))
            .join("")
        )

/** Remove unchanged properties from updateObject */
export function getChanged(baseObj, updateObj) {
  if (!baseObj) return { ...updateObj } // Handle null baseObject
  
  const result = {}
  for (const key in updateObj) {
    if (!deepEquals(baseObj[key], updateObj[key])) {
      result[key] = updateObj[key]
    }
  }
  return result
}


const focusDelayMs = 5 // Rough timing between onBlur & onFocus calls when shifting focus

/** Create a focus/blur listeners that will work when focus/blur leaves a parent element.
 *  - Return object should be spread within parent element:
 *  ```jsx
 *  const listeners = useParentFocus(...)
 *  <div {...listeners} />
 *  ```
 */
export function useParentFocus(focusHandler, blurHandler) {
    const timeout = useRef(null)
    if (!focusHandler && !blurHandler) return {}

    return {
        onFocus: (ev) => {
            if (timeout.current !== null) clearTimeout(timeout.current)
            else if (typeof focusHandler === 'function') focusHandler(ev)
        },

        onBlur: (ev) => {
            if (timeout.current !== null) clearTimeout(timeout.current)

            timeout.current = setTimeout(() => {
                if (typeof blurHandler === 'function') blurHandler(ev)
                timeout.current = null
            }, focusDelayMs)
        },
    }
}


/** Throttle function call, forces call on unmount */
export function useThrottle(interval) {
	let timer = useRef(null), func = useRef(null)

  const execFunc = useCallback(() => {
    timer.current = null
    if (func.current) func.current()
    func.current = null
  }, [])

  useEffect(() => () => {
    clearTimeout(timer.current)
    execFunc()
  }, [execFunc])

  return useCallback((callFunc) => {
    func.current = callFunc
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(execFunc, interval)
  }, [execFunc, interval])
}

/**
 * Listen & handle hotkeys
 * @param {{ [key: string]: () => any }} hotkeyMap `{ [key]: () => action(), ... }` **MUST BE STATIC**
 * @param {{ skip: boolean, deps: any[] }} options Skip will disable hotkeys, Deps is dependency array for `hotkeyMap`
 */
export function useHotkeys(hotkeyMap, { skip, deps } = {}) {
  const hotkeyHandler = useCallback((ev) => {
    // console.debug(' >> KeyName: ',ev.key); // print names of keys

    if (!hotkeyMap[ev.key]) return;
    ev.preventDefault();

    if (typeof hotkeyMap[ev.key] === 'function') hotkeyMap[ev.key](ev);
    else if (debugLogging) console.error('Malformed keyMap for', ev.key, hotkeyMap[ev.key]);

  // eslint-disable-next-line
  }, deps);

  useEffect(() => {
    if (!skip) document.addEventListener('keydown', hotkeyHandler, false);
    else document.removeEventListener('keydown', hotkeyHandler, false);

    return () => document.removeEventListener('keydown', hotkeyHandler, false);
  
  // eslint-disable-next-line
  }, deps && deps.concat(skip));
}


/** Provides a ref to give to an object you want to be scrolled to if invisible
 *   - `options`: see `IntersectionObserver` options & `ScrollIntoView` options
 */
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