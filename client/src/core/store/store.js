import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'remote-redux-devtools'
import globalSlice from './globalSlice'
import alertSlice from './alertSlice'
import { fetchApi } from './fetchApi'
import errorMiddleware from '../services/error.services'

// Load in basic queries to allow prefetching w/ lazy loading
import { } from "../../pages/common/common.fetch"
import { } from "../../pages/schedule/schedule.fetch"
import { } from "../../pages/match/match.fetch"

const thunkExtra = { store: null }

const store = configureStore({
  reducer: {
    global: globalSlice,
    alert: alertSlice,
    [fetchApi.reducerPath]: fetchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: { extraArgument: thunkExtra } })
      .concat(errorMiddleware)
      .concat(fetchApi.middleware),
  
  // Enable remote dev tools
  devTools: false,
  enhancers: process.env.NODE_ENV === "development" ? (getDefaultEnhancers) => 
    getDefaultEnhancers().concat(
      devToolsEnhancer({
        name: 'tournament-tracker',
        hostname: '192.168.0.179',
        port: 8000,
        realtime: true, 
      })
     ) : undefined,
})

thunkExtra.store = store
export default store