import { createSlice } from "@reduxjs/toolkit"

export const initialState = {
  isOpen:  false,
  title:   null,
  message: '',
  buttons: ['Ok'],
  callback: null,
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState, 
  reducers: {
    openAlert:  (state, action) => Object.assign(state, action.payload, { isOpen: true }),
    closeAlert: () => ({ ...initialState }),
  },
})

export const { openAlert, closeAlert } = alertSlice.actions
export default alertSlice.reducer