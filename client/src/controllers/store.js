import { configureStore } from '@reduxjs/toolkit'
import { dbApi } from '../models/dbApi'

export default configureStore({
  reducer: {
    [dbApi.reducerPath]: dbApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dbApi.middleware),
})