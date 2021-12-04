import { configureStore } from '@reduxjs/toolkit'
import { dbApi } from './dbApi'

export default configureStore({
  reducer: {
    [dbApi.reducerPath]: dbApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dbApi.middleware),
})