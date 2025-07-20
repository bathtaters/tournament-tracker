import { useLayoutEffect } from "react";

// Must include when porting SuggestText
export { useScrollToRef, useHotkeys } from "../../services/basic.services";

// Determine if list is valid
export const validList = (list) => Array.isArray(list) && Boolean(list.length);

// Hotkey Handlers
export const getNext = (curr, total) =>
  curr + 1 >= total || curr < 0 ? 0 : curr + 1;
export const getPrev = (curr, total) =>
  curr <= 0 || curr > total ? total - 1 : curr - 1;

// Get index of entry if it is the ONLY entry where 'isStatic' = FALSE, otherwise return null
export const getNonStaticSoloIdx = (list) => {
  let nssIdx = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].isStatic) continue;
    else if (nssIdx == null) nssIdx = i;
    else return -1;
  }
  return nssIdx;
};

// Hook that works like 'useLayoutEffect', plus triggers effect on 'listenerType' event
export function useLayoutListener(listenerTypes, effect, deps) {
  useLayoutEffect(() => {
    listenerTypes.forEach((type) => window.addEventListener(type, effect));
    effect();
    return () => {
      listenerTypes.forEach((type) => window.removeEventListener(type, effect));
    };
    // eslint-disable-next-line
  }, deps);
}
