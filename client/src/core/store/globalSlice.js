import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

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

// Create Promise for lockScreen
export const lockScreenUntilLoaded = createAsyncThunk(
  'global/lockScreenPromise',
  async (caption, { dispatch, extra }) => {
    const store = extra.store

    // Lock screen
    dispatch(globalSlice.actions.lockScreen(caption))
    
    return new Promise((resolve) => {
      const unsubscribe = store.subscribe(() => {
        const globalState = store.getState().global
        
        // Unlock when no longer fetching
        if (!globalState.isFetching) {
          unsubscribe()
          dispatch(globalSlice.actions.unlockScreen())
          resolve(true)
        }
      })
    })

  }
)

export const { setFetch, lockScreen, unlockScreen } = globalSlice.actions

export default globalSlice.reducer