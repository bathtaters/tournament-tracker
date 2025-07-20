import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { usePrefetch } from "./common.fetch";
import { useLockScreen } from '../../core/services/global.services';
import { deepEquals, useThrottle } from "./services/basic.services";
import { getLocalVar, setLocalVar } from "./services/fetch.services";
import { useOpenAlert, useCloseAlert, useAlertStatus, useAlertResult } from "./services/alert.services";
export { useOpenAlert, useCloseAlert, useAlertStatus, useAlertResult, useLockScreen }

// Preload page data
export function usePrefetchBase() {
  const loadSched  = usePrefetch('schedule')
  const loadEvent  = usePrefetch('event')
  const loadPlayer = usePrefetch('player')
  const loadStats  = usePrefetch('stats')
  useEffect(
    () => { loadSched(); loadEvent(); loadPlayer(); loadStats(); },
    [loadSched,loadEvent,loadPlayer,loadStats]
  )
}

// Preload event data
export function usePrefetchEvent() {
  const prefetchEvent = usePrefetch('event')
  const prefetchMatch = usePrefetch('match')
  const prefetchStats = usePrefetch('stats')
  return (id) => { prefetchEvent(id); prefetchMatch(id); prefetchStats(id); }
}

export function useLocalStorage(key, initial = null) {
  const dispatch = useDispatch()
  const [ state, setState ] = useState(getLocalVar(key ?? initial))
  
  const updateValue = useCallback((value) => {
    if (typeof value === 'function') {
      setState((val) => {
        val = value(val)
        setLocalVar(key, val, dispatch)
        return val
      })
    } else {
      setState(value)
      setLocalVar(key, value, dispatch)
    }
  }, [key, dispatch])
  
  return [ state, updateValue, setState ]
}

/**
 * useState that syncs its internal state with an external value
 * and includes a custom equality check.
 *
 * @param {any} extValue - The external value to sync with.
 * @param {(a: any, b: any) => boolean} [isEqual] - Optional custom equality function.
 * @returns {[any, (val: any) => void]} - The internalValue and a setter function.
 */
export function useSyncState(extValue, isEqual) {
  const prev = useRef(extValue)
  const [ intVal, setIntVal ] = useState(extValue)

  useEffect(() => {
    if (!isEqual?.(prev.current, extValue)) {
      prev.current = extValue
      setIntVal(extValue)
    }
  }, [extValue, isEqual])

  return [ intVal, setIntVal ]
}
export const useSyncStateList = (propList) => useSyncState(propList || [], deepEquals)


/**
 * Delay and throttle server updates while syncing to external value
 *
 * @param {any} value - External value to sync with.
 * @param {(val: any) => void} serverUpdate - Callback to update the server.
 * @param {Object} options
 * @param {(fn: Function) => Function} [options.throttle] - Throttle function wrapper.
 * @param {(a: any, b: any) => boolean} [options.isEqual] - Custom equality function.
 *
 * @returns {[any, (val: any) => void]} - [localValue, setLocalValue]
 */

export function useServerValue(value, updateServerCallback, { throttleDelay = 500, equalsTest } = {}) {
  // Init hooks
  const throttle = useThrottle(throttleDelay)
  const [ localVal, setLocal ] = useSyncState(value, equalsTest)

  // Update function
  const setValue = useCallback((newValue) => {

    // Uses setState((currVal) => newVal) form
    if (typeof newValue === 'function') return setLocal((local) => {
      const val = newValue(local)
      throttle(() => updateServerCallback(val))
      return val
    })

    // Use setState(newVal) form
    setLocal(newValue)
    throttle(() => updateServerCallback(newValue))
  }, [setLocal, throttle, updateServerCallback])

  // Return value & setter
  return [ localVal, setValue ]
}
export const useServerListValue = (listValue, updateServerCallback, options = {}) =>
  useServerValue(listValue || [], updateServerCallback, { equalsTest: deepEquals, ...options })


// Scales height based on internal content (padding = vertical padding, everything is in pixels)
export function useScaleToFitRef(depends = [], { padding = 0, minHeight = 32 } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    ref.current.style.height = 'inherit' // initial value
    ref.current.style.height = Math.max(ref.current.scrollHeight + padding, minHeight) + 'px'
  // eslint-disable-next-line
  }, depends.concat(padding, minHeight)) // Re-render on depends change

  return ref
}

// Runs 'onClick' when you click outside of ref element (if skip == falsy)
export function useOnClickOutsideRef(onClick, { depends = [], skip }) {
  const ref = useRef(null)

  useEffect(() => {
    if (skip || !ref.current) return;

    // Build & register listener
    const onOutsideClick = (ev) => { !ref.current.contains(ev.target) && onClick() }
    document.addEventListener("mousedown", onOutsideClick)

    // Cleanup listener
    return () => { document.removeEventListener("mousedown", onOutsideClick) }
  
  // eslint-disable-next-line
  }, [...depends, onClick, skip, Boolean(ref.current)])

  return ref
}
