import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'remote-redux-devtools'
import { fetchApi } from './fetchApi'

// Load in basic queries to allow prefetching w/ lazy loading
import { } from "../../pages/common/common.fetch";
import { } from "../../pages/schedule/schedule.fetch";
import { } from "../../pages/match/match.fetch";

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