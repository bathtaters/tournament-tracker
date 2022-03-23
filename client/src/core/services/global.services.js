import { useSelector, useDispatch } from "react-redux";
import { fetchApi, tagTypes } from "../store/fetchApi";
import { setFetch, setAlert } from "../store/globalSlice";

// Get global status
export const useGlobalFetching = () => useSelector((state) => state.global.isFetching)

export function useGlobalAlert() {
  const dispatch = useDispatch()
  return [
    useSelector((state) => state.global.isAlert),
    (open = true) => dispatch(setAlert(open)),
  ]
}

// Check if any queries are currently running, set global
export function useFetchingProvider(reducerPath = fetchApi.reducerPath) {
  // Get actual value
  const anyLoading = useSelector((state) => Object.values(state[reducerPath].queries).some(qry => qry.status === 'pending'))
  // Get stored value
  const isFetching = useSelector((state) => state.global.isFetching)
  
  // Set state to actual value
  const dispatch = useDispatch()
  if (anyLoading !== isFetching) dispatch(setFetch(anyLoading))
}


// Force refetch of all data
export function useForceRefetch() {
  const dispatch = useDispatch()
  return () => dispatch(fetchApi.util.invalidateTags(tagTypes))
}