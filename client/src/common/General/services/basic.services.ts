import {
  type FocusEvent,
  type FocusEventHandler,
  type MouseEventHandler,
  type Ref,
  type SetStateAction,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { debugLogging } from "../../../assets/config";

/** Test to values for equality, works for arrays/objects but not functions */
export function deepEquals(val1: any, val2: any): boolean {
  if (val1 === val2) return true;

  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((item, index) => deepEquals(item, val2[index]));
  }

  if (typeof val1 === "object" && typeof val2 === "object" && val1 && val2) {
    const keys = Object.keys(val1);
    if (keys.length !== Object.keys(val2).length) return false;
    return keys.every((key) => deepEquals(val1[key], val2[key]));
  }

  return false;
}

// ---- Temporary IDs ---- \\
const TEMP_ID_PREFIX = "TEMPID";
const tempId = (type: string) => (n: number) =>
  `${TEMP_ID_PREFIX}-${type}-${("0000" + n).slice(-4)}`;

/** Check if ID is temporary */
export const isTempId = (id: string) =>
  id.slice(0, TEMP_ID_PREFIX.length) === TEMP_ID_PREFIX;

/** Generate a temporary ID */
export const nextTempId = (type: string, exists: string[]) => {
  if (!exists) return tempId(type)(0);
  let n = 0,
    id: string | undefined;
  const getId = tempId(type);
  while (++n < 10000) {
    id = getId(n);
    if (!exists.includes(id)) break;
  }
  return id;
};

/** Gets an event with the value replaced. */
export const eventWithValue = <E extends SyntheticEvent>(
  event: E,
  value: any,
  isCheckbox = false,
): E => ({
  ...event,
  target: {
    ...event.target,
    [isCheckbox ? "checked" : "value"]: value,
  },
});

/** Generates 'onClick' events for mouse and touch screen:
 *  ```jsx
 *   <div {...onClickAll(cb)} />
 *  ```*/
export const onClickAll = (handler: MouseEventHandler) => ({
  onMouseDown: handler,
  onTouchStart: handler,
});

/** Simple SHA-256 hash of text. Returns null if input is falsy. */
export const hashText = (text: string): Promise<string | null> =>
  !text
    ? Promise.resolve(null)
    : window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(text))
        .then((z) =>
          Array.from(new Uint8Array(z))
            .map((d) => d.toString(16).padStart(2, "0"))
            .join(""),
        );

/** Remove unchanged properties from updateObject */
export function getChanged<T extends Record<any, any>>(
  baseObj: Readonly<T> | null,
  updateObj: Readonly<Partial<T>>,
) {
  if (!baseObj) return { ...updateObj }; // Handle null baseObject

  const result = {} as Partial<T>;
  for (const key in updateObj) {
    if (!deepEquals(baseObj[key], updateObj[key])) {
      result[key] = updateObj[key];
    }
  }
  return result;
}

const focusDelayMs = 5; // Rough timing between onBlur & onFocus calls when shifting focus

/** Create a focus/blur listeners that will work when focus/blur leaves a parent element.
 *  - Return object should be spread within the parent element:
 *  ```jsx
 *  const listeners = useParentFocus(...)
 *  <div {...listeners} />
 *  ```
 */
export function useParentFocus<T>(
  focusHandler: FocusEventHandler<T>,
  blurHandler: FocusEventHandler<T>,
): { onFocus?: FocusEventHandler<T>; onBlur?: FocusEventHandler<T> } {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  if (!focusHandler && !blurHandler) return {};

  return {
    onFocus: (ev: FocusEvent<T>) => {
      if (timeout.current !== null) clearTimeout(timeout.current);
      else if (typeof focusHandler === "function") focusHandler(ev);
    },

    onBlur: (ev: FocusEvent<T>) => {
      if (timeout.current !== null) clearTimeout(timeout.current);

      timeout.current = setTimeout(() => {
        if (typeof blurHandler === "function") blurHandler(ev);
        timeout.current = null;
      }, focusDelayMs);
    },
  };
}

/** Throttle function call. Forces call when the component unmounts. */
export function useThrottle(interval: number) {
  let timer = useRef<NodeJS.Timeout | null>(null),
    func = useRef<() => any>(null);

  const execFunc = useCallback(() => {
    timer.current = null;
    if (func.current) func.current();
    func.current = null;
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      execFunc();
    },
    [execFunc],
  );

  return useCallback(
    (callFunc: () => any) => {
      func.current = callFunc;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(execFunc, interval);
    },
    [execFunc, interval],
  );
}

/**
 * Listen & handle hotkeys
 * @param hotkeyMap `{ [key]: () => action(), ... }` **MUST BE STATIC**
 * @param options Skip will disable hotkeys, Deps is a dependency array for `hotkeyMap`
 */
export function useHotkeys(
  hotkeyMap: Readonly<
    Partial<Record<KeyboardEventKeys, (ev: KeyboardEvent) => any>>
  >,
  { skip = false, deps = [] } = {},
) {
  const hotkeyHandler = useCallback((ev: KeyboardEvent) => {
    // console.debug(' >> KeyName: ',ev.key); // print names of keys

    if (!hotkeyMap[ev.key]) return;
    ev.preventDefault();

    if (typeof hotkeyMap[ev.key] === "function") hotkeyMap[ev.key](ev);
    else if (debugLogging)
      console.error("Malformed keyMap for", ev.key, hotkeyMap[ev.key]);

    // eslint-disable-next-line
  }, deps);

  useEffect(
    () => {
      if (!skip) document.addEventListener("keydown", hotkeyHandler, false);
      else document.removeEventListener("keydown", hotkeyHandler, false);

      return () =>
        document.removeEventListener("keydown", hotkeyHandler, false);
    },
    // eslint-disable-next-line
    deps && deps.concat(skip),
  );
}

/** Provides a ref to give to an object you want to be scrolled to if invisible
 *   - `options`: see `IntersectionObserver` options & `ScrollIntoView` options
 */
export function useScrollToRef({
  // Observer options
  rootRef = null,
  threshold = 1.0,
  rootMargin = "0px",
  // ScrollIntoView options
  behavior = "auto",
  block = "start",
  inline = "nearest",
}: ScrollToRefProps = {}) {
  // Create scroll callback
  const [elementRef, setRef] = useState<Element>(null);

  // Add/Remove observer listener
  useEffect(() => {
    const root =
      rootRef && "current" in rootRef
        ? rootRef.current
        : (rootRef as Element | Document);

    const observer = new IntersectionObserver(
      (entries) => {
        if (elementRef && !entries[0].isIntersecting)
          elementRef.scrollIntoView({ behavior, block, inline });
      },
      { root, threshold, rootMargin },
    );

    if (elementRef) observer.observe(elementRef);

    return () => {
      if (elementRef) observer.unobserve(elementRef);
    };
  }, [elementRef, rootRef, threshold, rootMargin, behavior, block, inline]);

  // Get reference to the element to measure
  return (newRef: SetStateAction<Element>) => setRef(newRef);
}

// Property type (Copied from JavaScript developer docs for IntersectionObserver)

type ScrollToRefProps = Partial<{
  /** Reference to an Element or Document object which is an ancestor of the intended target,
   * whose bounding rectangle will be considered the viewport.
   * Any part of the target not visible in the visible area of the root is not considered visible.
   * If not specified, the observer uses the document's viewport as the root, with no margin, and a 0% threshold
   * (meaning that even a one-pixel change is enough to trigger a callback). */
  rootRef: Ref<Element | Document> | Element | Document | null;
  /** Either a single number or an array of numbers between 0.0 and 1.0,
   * specifying a ratio of intersection area to total bounding box area for the observed target.
   * A value of 0.0 means that even a single visible pixel counts as the target being visible.
   * 1.0 means that the entire target element is visible.
   * See Thresholds for a more in-depth description of how thresholds are used. */
  threshold: number | number[];
  /** A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections,
   * effectively shrinking or growing the root for calculation purposes.
   * The syntax is approximately the same as that for the CSS margin property;
   * see the intersection root and root margin for more information on how the margin works and the syntax. */
  rootMargin: string;
  /** Determines whether scrolling is instant or animates smoothly.
   *    This option is a string that must take one of the following values:
   * - ***smooth***: scrolling should animate smoothly
   * - ***instant***: scrolling should happen instantly in a single jump
   * - ***auto***: scroll behavior is determined by the computed value of scroll-behavior */
  behavior: "smooth" | "instant" | "auto";
  /** Defines the vertical alignment of the element within the scrollable ancestor container.
   *    This option is a string and accepts one of the following values:
   * - ***start***: Aligns the element's top edge with the top of the scrollable container,
   *    making the element appear at the start of the visible area vertically.
   * - ***center***: Aligns the element vertically at the center of the scrollable container,
   *    positioning it in the middle of the visible area.
   * - ***end***: Aligns the element's bottom edge with the bottom of the scrollable container,
   *    placing the element at the end of the visible area vertically.
   * - ***nearest***: Scrolls the element to the nearest edge in the vertical direction.
   *    If the element is closer to the top edge of the scrollable container, it will align to the top;
   *    if it's closer to the bottom edge, it will align to the bottom. This minimizes the scrolling distance. */
  block: "start" | "center" | "end" | "nearest";
  /** Defines the horizontal alignment of the element within the scrollable ancestor container.
   *    This option is a string and accepts one of the following values:
   * - ***start***: Aligns the element's left edge with the left of the scrollable container,
   *    making the element appear at the start of the visible area horizontally.
   * - ***center***: Aligns the element horizontally at the center of the scrollable container,
   *    positioning it in the middle of the visible area.
   * - ***end***: Aligns the element's right edge with the right of the scrollable container,
   *    placing the element at the end of the visible area horizontally.
   * - ***nearest***: Scrolls the element to the nearest edge in the horizontal direction.
   *    If the element is closer to the left edge of the scrollable container, it will align to the left;
   *    if it's closer to the right edge, it will align to the right. This minimizes the scrolling distance. */
  inline: "start" | "center" | "end" | "nearest";
}>;

/** Popular keys for KeyboardEvent 'keys' property
 * (If one you need is missing, add it here type) */
type KeyboardEventKeys =
  // Common editing
  | "Enter"
  | "Escape"
  | "Tab"
  | " "
  | "Backspace"
  | "Delete"

  // Modifiers
  | "Shift"
  | "Control"
  | "Alt"
  | "Meta"

  // Navigation
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"

  // Function keys
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12"

  // Letters and numbers
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
