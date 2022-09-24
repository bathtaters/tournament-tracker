import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { alert, debugLogging } from "../../assets/config"

export const initialState = { isOpen: false }

export const alertSlice = createSlice({
  name: 'alert',
  initialState, 
  reducers: {
    openAlert:  (state, action) => {
      if (!state.isOpen) return Object.assign(state, action.payload, { result: undefined, isOpen: true })
      debugLogging && console.warn('Cannot open alert while already open', state, action.payload)
      return state
    },

    closeAlert: (state, action) => {
      if (state.isOpen) return { ...initialState, result: action.payload ?? state.defaultResult }
      debugLogging && console.warn('Cannot close alert while already closed', state, action.payload)
      return state
    },   
  }
})

// Create Promise for openAlert
export const openAlert = createAsyncThunk(
  'alert/openAlertPromise',
  async (alertOptions, { dispatch, extra }) => {
    const store = extra.store

    // Run open reducer
    dispatch(alertSlice.actions.openAlert(alertOptions))
    
    // Create thunk promise
    return new Promise((resolve) => {
      const unsubscribe = store.subscribe(() => {
        const alertState = store.getState().alert
        
        // Subscribe to result, resolves when result is set
        if (alertState.result !== undefined) {
          unsubscribe();
          resolve(alertState.result);
        
        // Returns default result if closed without result being set
        } else if (!alertState.isOpen) {
          unsubscribe();
          resolve(alert.defaultResult);
        }
      })
    })

  }
)

export const { closeAlert } = alertSlice.actions
export default alertSlice.reducer