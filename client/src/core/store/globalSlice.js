import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isFetching: true,
  lockScreen: { isLocked: false },
}

export const globalSlice = createSlice({
  name: 'global',
  initialState, 
  reducers: {
    setFetch: (state, action) => { state.isFetching = Boolean(action.payload) },
    lockScreen:  (state, action) => { state.lockScreen = { isLocked: true, caption: action.payload } },
    unlockScreen: (state) => { state.lockScreen = { ...initialState.lockScreen } },
  },
})

export const { setFetch, lockScreen, unlockScreen } = globalSlice.actions

export default globalSlice.reducer