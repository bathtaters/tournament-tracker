import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./globalSlice";
import alertSlice from "./alertSlice";
import { fetchApi } from "./fetchApi";
import errorMiddleware from "../services/error.services";

// Load in basic queries to allow prefetching w/ lazy loading
import {} from "../../pages/common/common.fetch";
import {} from "../../pages/schedule/schedule.fetch";
import {} from "../../pages/match/match.fetch";

const thunkExtra = { store: null };

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
});

thunkExtra.store = store;
export default store;
