import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isFetching: true,
}

export const globalSlice = createSlice({
  name: 'global',
  initialState, 
  reducers: {
    setFetch: (state, action) => { state.isFetching = Boolean(action.payload) }
  },
})

export const { setFetch } = globalSlice.actions

export default globalSlice.reducer