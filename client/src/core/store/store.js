import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'remote-redux-devtools'
import globalSlice from './globalSlice';
import alertSlice from './alertSlice';
import { fetchApi } from './fetchApi'

// Load in basic queries to allow prefetching w/ lazy loading
import { } from "../../pages/common/common.fetch";
import { } from "../../pages/schedule/schedule.fetch";
import { } from "../../pages/match/match.fetch";

export default configureStore({
  reducer: {
    global: globalSlice,
    alert: alertSlice,
    [fetchApi.reducerPath]: fetchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fetchApi.middleware),
  
  // Enable remote dev tools
  devTools: false,
  enhancers: [
    devToolsEnhancer({
      name: 'tournament-tracker',
      hostname: '192.168.0.179',
      port: 8000,
      realtime: true, 
    })
  ],
})