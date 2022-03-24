import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const initialState = {
  isOpen:  false,
  title:   undefined,
  message: undefined,
  className: '',
  buttons: ['Ok'],
  result:  undefined,
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState, 
  reducers: {
    openAlert:  (state, action) => 
      state.isOpen ? state : Object.assign(state, action.payload, { result: undefined, isOpen: true }),

    closeAlert: (state, action) =>
      state.isOpen ? Object.assign({}, initialState, { result: action.payload }) : state,
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
    return new Promise((resolve, reject) => {
      const unsubscribe = store.subscribe(() => {
        const alertState = store.getState().alert
        
        // Subscribe to result, resolves when result is set
        if (alertState.result !== undefined) {
          unsubscribe();
          resolve(alertState.result);
        
        // Rejects if closed without result being set
        } else if (!alertState.isOpen) {
          unsubscribe();
          reject('Alert closed without result');
        }
      })
    })

  }
)

export const { closeAlert } = alertSlice.actions
export default alertSlice.reducer