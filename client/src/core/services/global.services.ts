import type { RootState } from "../store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApi, tagTypes } from "../store/fetchApi";
import { lockScreen, setFetch, unlockScreen } from "../store/globalSlice";

// Get global status
export const useFetchingStatus = () =>
  useSelector((state: RootState) => state.global.isFetching);

// Get args of all cache items under a given endpoint
export const getCachedArgs = (globalState: RootState, endpoint: string) =>
  Object.values(globalState.dbApi.queries)
    .filter(
      ({ endpointName, originalArgs }) =>
        originalArgs && endpointName === endpoint,
    )
    .map(({ originalArgs }) => originalArgs);

// Check if any queries are currently running, set global
export function useFetchingProvider(reducerPath = fetchApi.reducerPath) {
  // Get actual value
  const anyLoading = useSelector((state: RootState) =>
    Object.values(state[reducerPath].queries).some(
      (qry) => qry.status === "pending",
    ),
  );

  // Set state to actual value
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setFetch(anyLoading));
  }, [dispatch, anyLoading]);

  return anyLoading;
}

// Force refetch of all data
export function useForceRefetch() {
  const dispatch = useDispatch();
  return () => dispatch(fetchApi.util.invalidateTags(tagTypes.slice()));
}

// Lock on isLoading = true, unlock when anyFetching = false
export function useLockScreen(isLoading: boolean, caption?: string) {
  const dispatch = useDispatch();
  const isLocked = useSelector(
    (state: RootState) => state.global.lockScreen.isLocked,
  );

  useEffect(() => {
    if (!isLoading) dispatch(lockScreen(caption));
  }, [dispatch, isLoading, caption]);

  return [
    isLocked,
    (overrideCaption?: string) =>
      dispatch(lockScreen(overrideCaption ?? caption)),
    () => dispatch(unlockScreen()),
  ];
}
