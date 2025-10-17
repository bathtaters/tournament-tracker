import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./globalSlice";
import alertSlice, { alertMiddleware } from "./alertSlice";
import { fetchApi } from "./fetchApi";
import errorMiddleware from "../services/error.services";

// Load in basic queries to allow prefetching w/ lazy loading
import {} from "../../common/General/common.fetch";
import {} from "../../pages/schedule/schedule.fetch";
import {} from "../../pages/match/match.fetch";

const store = configureStore({
  reducer: {
    global: globalSlice,
    alert: alertSlice,
    [fetchApi.reducerPath]: fetchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(errorMiddleware)
      .concat(fetchApi.middleware)
      .concat(alertMiddleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
