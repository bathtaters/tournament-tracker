import type { Settings } from "types/models";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { scheduleApi } from "../../pages/schedule/schedule.fetch";
import { matchApi } from "../../pages/match/match.fetch";
import { useLockScreen } from "../../core/services/global.services";
import { deepEquals, useThrottle } from "./services/basic.services";
import { getLocalVar, setLocalVar } from "./services/fetch.services";
import {
  useAlertResult,
  useAlertStatus,
  useCloseAlert,
  useOpenAlert,
} from "../Alert/alert.services";

export {
  useOpenAlert,
  useCloseAlert,
  useAlertStatus,
  useAlertResult,
  useLockScreen,
};

/** Preload page data */
export function usePrefetchBase() {
  const loadSched = scheduleApi.usePrefetch("schedule");
  const loadEvent = scheduleApi.usePrefetch("event");
  const loadPlayer = scheduleApi.usePrefetch("player");
  const loadStats = scheduleApi.usePrefetch("stats");
  useEffect(() => {
    loadSched(null);
    loadEvent(null);
    loadPlayer(null);
    loadStats(null);
  }, [loadSched, loadEvent, loadPlayer, loadStats]);
}

/** Preload event data */
export function usePrefetchEvent() {
  const prefetchEvent = matchApi.usePrefetch("event");
  const prefetchMatch = matchApi.usePrefetch("match" as any);
  const prefetchStats = matchApi.usePrefetch("stats");
  return (id: string) => {
    prefetchEvent(id);
    prefetchMatch(id);
    prefetchStats(id);
  };
}

export function useLocalStorage<K extends keyof Settings>(
  key: K,
  initial?: Settings[K],
) {
  const dispatch = useDispatch();
  const [state, setState] = useState(getLocalVar(key) ?? initial);

  const updateValue = useCallback(
    (value: SetParam<Settings[K]>) => {
      if (typeof value === "function") {
        setState((val) => {
          val = value(val);
          setLocalVar(key, val, dispatch);
          return val;
        });
      } else {
        setState(value);
        setLocalVar(key, value, dispatch);
      }
    },
    [key, dispatch],
  );

  return [state, updateValue, setState] as const;
}

/**
 * useState that syncs its internal state with an external value
 * and includes a custom equality check.
 *
 * @param {any} extValue - The external value to sync with.
 * @param {(a: any, b: any) => boolean} [isEqual] - Optional custom equality function.
 * @returns {[any, (val: any) => void]} - The internalValue and a setter function.
 */
export function useSyncState<T>(
  extValue: T,
  isEqual?: (a: T, b: T) => boolean,
) {
  const prev = useRef(extValue);
  const [intVal, setIntVal] = useState(extValue);

  useEffect(() => {
    if (!isEqual?.(prev.current, extValue)) {
      prev.current = extValue;
      setIntVal(extValue);
    }
  }, [extValue, isEqual]);

  return [intVal, setIntVal] as const;
}

/**
 * Delay and throttle server updates while syncing to external value
 *
 * @param {any} value - External value to sync with.
 * @param {(val: any) => void} updateServerCallback - Callback to update the server.
 * @param {object} [options] - Options object.
 * @param {number} [options.throttleDelay] - Delay (in ms) before updating the server.
 * @param {(a: any, b: any) => boolean} [options.equalsTest] - Custom equality function.
 *
 * @returns {[any, (val: any) => void]} - [localValue, setLocalValue]
 */
export function useServerValue<
  T extends string | number | boolean | any[] | Record<any, any>,
>(
  value: T,
  updateServerCallback: (value: T) => void,
  { throttleDelay = 500, equalsTest }: ServerValueOptions<T> = {},
) {
  // Init hooks
  const throttle = useThrottle(throttleDelay);
  const [localVal, setLocal] = useSyncState(value, equalsTest);

  // Update function
  const setValue = useCallback(
    (newValue: SetParam<T>) => {
      // Uses setState((currVal) => newVal) form
      if (typeof newValue === "function")
        return setLocal((local) => {
          const val: T = newValue(local);
          throttle(() => updateServerCallback(val));
          return val;
        });

      // Use setState(newVal) form
      setLocal(newValue);
      throttle(() => updateServerCallback(newValue));
    },
    [setLocal, throttle, updateServerCallback],
  );

  // Return value & setter
  return [localVal, setValue] as const;
}
export const useServerListValue = <T>(
  listValue: T[],
  updateServerCallback: (value: T[]) => void,
  options: ServerValueOptions<T> = {},
) =>
  useServerValue(listValue ?? [], updateServerCallback, {
    equalsTest: deepEquals,
    ...options,
  });

/** Scales height based on internal content (padding = vertical padding, everything is in pixels) */
export function useScaleToFitRef(
  depends: any[] = [],
  { padding = 0, minHeight = 32 } = {},
) {
  const ref = useRef<HTMLBaseElement>(null);

  useLayoutEffect(
    () => {
      ref.current.style.height = "inherit"; // initial value
      ref.current.style.height =
        Math.max(ref.current.scrollHeight + padding, minHeight) + "px";
    },
    // eslint-disable-next-line
    depends.concat(padding, minHeight),
  ); // Re-render on dependency change

  return ref;
}

/** Runs 'onClick' when you click outside of ref element (if skip == falsy) */
export function useOnClickOutsideRef(
  onClick: () => any,
  { depends = [], skip = false } = {},
) {
  const ref = useRef<HTMLBaseElement>(null);
  const _skip = skip || !ref.current;

  useEffect(() => {
    if (_skip) return;

    // Build & register listener
    const onOutsideClick = (ev: MouseEvent) => {
      !ref.current.contains(ev.target as Node) && onClick();
    };
    document.addEventListener("mousedown", onOutsideClick);

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
    };

    // eslint-disable-next-line
  }, [...depends, onClick, _skip]);

  return ref;
}

// Types

type SetParam<T> = T | ((current: T) => T);
type ServerValueOptions<T> = {
  throttleDelay?: number;
  equalsTest?: (a: T, b: T) => boolean;
};
