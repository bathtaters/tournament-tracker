import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchApi, tagTypes } from "../store/fetchApi";
import { setFetch } from "../store/globalSlice";

// Get global status
export const useFetchingStatus = () => useSelector((state) => state.global.isFetching)


// Check if any queries are currently running, set global
export function useFetchingProvider(reducerPath = fetchApi.reducerPath) {
  // Get actual value
  const anyLoading = useSelector((state) => Object.values(state[reducerPath].queries).some(qry => qry.status === 'pending'))
  // Get stored value
  const isFetching = useSelector((state) => state.global.isFetching)
  
  // Set state to actual value
  const dispatch = useDispatch()
  if (anyLoading !== isFetching) dispatch(setFetch(anyLoading))

  return anyLoading
}


// Force refetch of all data
export function useForceRefetch() {
  const dispatch = useDispatch()
  return () => dispatch(fetchApi.util.invalidateTags(tagTypes))
}