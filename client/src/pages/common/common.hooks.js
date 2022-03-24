import { useState, useEffect, useCallback } from "react";
import { usePrefetch } from "./common.fetch";
import { useOpenAlert, useCloseAlert, useAlertStatus, useAlertResult } from "./services/alert.services";
export { useOpenAlert, useCloseAlert, useAlertStatus, useAlertResult }

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
export function usePropState(propVal, equalsTest = (a,b) => a === b, depends = []) {
  const [ localVal, setLocal ] = useState(propVal)
  const equals = useCallback(equalsTest, depends)

  useEffect(() => {
    setLocal((stateVal) => equals(stateVal, propVal) ? stateVal : propVal)
  }, [JSON.stringify(propVal), ...depends])

  return [ localVal, setLocal ]
}

// Delay and bundle server updates
export function useServerValue(value, setServerCallback, updateBundleDelay = 500) {
  // Local value
  const [ localVal, setLocal ] = usePropState(value)

  // Delay and bundle updates
  useEffect(() => {
    if (localVal === value) return

    const timer = setTimeout(() => setServerCallback(localVal), updateBundleDelay)
    return () => clearTimeout(timer)
  }, [localVal], )

  // Return value & setter
  return [ localVal, setLocal ]
}