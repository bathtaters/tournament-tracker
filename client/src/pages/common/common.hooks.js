import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { usePrefetch } from "./common.fetch";
import { useLockScreen } from '../../core/services/global.services';
import { equalArrays, useThrottle } from "./services/basic.services";
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

// Push prop updates to state
export function usePropState(propVal, equalsTest = (oldVal,newVal) => oldVal === newVal) {
  const ref = useRef(propVal)
  const [ localVal, setLocal ] = useState(ref.current)

  if (!equalsTest(ref.current, propVal)) ref.current = propVal
  // eslint-disable-next-line
  useEffect(() => setLocal(ref.current), [ref.current])

  return [ localVal, setLocal ]
}
export const usePropStateList = (propList) => usePropState(propList || [], equalArrays)

// Delay and throttle server updates
export function useServerValue(value, updateServerCallback, { throttleDelay = 500, equalsTest } = {}) {
  // Init hooks
  const throttle = useThrottle(throttleDelay)
  const [ localVal, setLocal ] = usePropState(value, equalsTest)

  // Update function
  const updateLocal = useCallback((newValue) => {

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
  return [ localVal, updateLocal ]
}
export const useServerListValue = (listValue, updateServerCallback, options = {}) =>
  useServerValue(listValue || [], updateServerCallback, { equalsTest: equalArrays, ...options })


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
