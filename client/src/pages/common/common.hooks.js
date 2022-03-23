import { useState, useEffect, useCallback } from "react";

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