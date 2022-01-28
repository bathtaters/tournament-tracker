import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'remote-redux-devtools';
import { baseApi } from '../models/baseApi'

export default configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  devTools: false,
  enhancers: [devToolsEnhancer({
    name: 'tournament-tracker',
    hostname: '192.168.0.179',
    port: 8000,
    realtime: true, 
  })],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})