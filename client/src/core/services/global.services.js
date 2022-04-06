import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchApi, tagTypes } from "../store/fetchApi";
import { setFetch, lockScreen, unlockScreen } from "../store/globalSlice";

// Get global status
export const useFetchingStatus = () => useSelector((state) => state.global.isFetching)


// Check if any queries are currently running, set global
export function useFetchingProvider(reducerPath = fetchApi.reducerPath) {
  // Get actual value
  const anyLoading = useSelector((state) => Object.values(state[reducerPath].queries).some(qry => qry.status === 'pending'))
  
  // Set state to actual value
  const dispatch = useDispatch()
  useEffect(() => { dispatch(setFetch(anyLoading)) }, [anyLoading])

  return anyLoading
}


// Force refetch of all data
export function useForceRefetch() {
  const dispatch = useDispatch()
  return () => dispatch(fetchApi.util.invalidateTags(tagTypes))
}


// Lock on isLoading = true, unlock when anyFetching = false
export function useLockScreen(isLoading, caption) {
  const dispatch = useDispatch()
  const isLocked = useSelector((state) => state.global.lockScreen.isLocked)
  const anyFetching = useFetchingStatus()

  useEffect(() => { if (isLoading) dispatch(lockScreen(caption)) }, [isLoading, caption])
  useEffect(() => { if (isLocked && !anyFetching && !isLoading) dispatch(unlockScreen()) }, [anyFetching, isLoading])

  return isLocked
}