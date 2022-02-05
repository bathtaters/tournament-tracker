import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'remote-redux-devtools'
import { fetchApi } from './fetchApi'

export default configureStore({
  reducer: {
    [fetchApi.reducerPath]: fetchApi.reducer,
  },
  devTools: false,
  enhancers: [devToolsEnhancer({
    name: 'tournament-tracker',
    hostname: '192.168.0.179',
    port: 8000,
    realtime: true, 
  })],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fetchApi.middleware),
})