import type { AppDispatch, RootState } from "../store/store";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApi, tagTypes } from "../store/fetchApi";
import { lockScreen, unlockScreen } from "../store/globalSlice";

/** Get args of all cache items under a given endpoint */
export const getCachedArgs = (globalState: RootState, endpoint: string) =>
  Object.values(globalState.dbApi.queries)
    .filter(
      ({ endpointName, originalArgs }) =>
        originalArgs && endpointName === endpoint,
    )
    .map(({ originalArgs }) => originalArgs);

/** Force refetch of all data */
export function useForceRefetch() {
  const dispatch = useDispatch();
  return () => dispatch(fetchApi.util.invalidateTags(tagTypes.slice()));
}

/** Lock on isLoading = true, unlock when anyFetching = false.
 *  Also returns lock/unlock functions to manually override. */
export function useLockScreen(isLoading: boolean, caption?: string) {
  const dispatch: AppDispatch = useDispatch();
  const isLocked = useSelector(
    (state: RootState) => state.global.lockScreen.isLocked,
  );

  const lock = useCallback(
    (overrideCaption?: string) =>
      dispatch(lockScreen(overrideCaption ?? caption)),
    [dispatch, caption],
  );

  const unlock = useCallback(() => dispatch(unlockScreen()), [dispatch]);

  useEffect(() => {
    if (!isLoading) lock();
  }, [isLoading, lock]);

  return [isLocked, lock, unlock] as const;
}
