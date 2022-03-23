import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isFetching: true,
  isAlert:    false,
}

export const globalSlice = createSlice({
  name: 'global',
  initialState, 
  reducers: {
    setFetch: (state, action) => { state.isFetching = Boolean(action.payload) },
    setAlert: (state, action) => { state.isAlert    = Boolean(action.payload) },
  },
})

export const { setAlert, setFetch } = globalSlice.actions

export default globalSlice.reducer