import type { AlertState } from "types/base";
import {
  createAsyncThunk,
  createSlice,
  type Middleware,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { alert, debugLogging } from "../../assets/config";

export const initialState: AlertState = {
  isOpen: false,
  ...alert,
};

export const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    openAlert: (state, action: PayloadAction<Partial<AlertState>>) => {
      if (!state.isOpen)
        return Object.assign(state, action.payload, {
          result: undefined,
          isOpen: true,
        });
      debugLogging &&
        console.warn(
          "Cannot open alert while already open",
          state,
          action.payload,
        );
      return state;
    },

    closeAlert: (state, action: PayloadAction<string>) => {
      if (state.isOpen)
        return {
          ...initialState,
          result: action.payload ?? state.defaultResult,
        };
      debugLogging &&
        console.warn(
          "Cannot close alert while already closed",
          state,
          action.payload,
        );
      return state;
    },
  },
});

/** Call to resolve an alert */
let alertPromise: Record<"resolve" | "reject", (value: string) => void> | null =
  null;

// Create middleware to check promise
export const alertMiddleware: Middleware = (store) => (next) => (action) => {
  const nextRes = next(action);

  // Handle alert promise resolution
  if (alertPromise) {
    const { isOpen, result } = store.getState().alert as AlertState;
    if (!isOpen) {
      alertPromise.resolve(result);
      alertPromise = null;
    }
  }

  return nextRes;
};

// Create Promise for openAlert
export const openAlert = createAsyncThunk(
  "alert/openAlertPromise",
  async (alertState: Partial<AlertState>, { dispatch }) => {
    dispatch(alertSlice.actions.openAlert(alertState));
    return new Promise<string>((resolve, reject) => {
      if (alertPromise) alertPromise.reject("Alert opened before resolved");
      alertPromise = { resolve, reject };
    });
  },
);

export const { closeAlert } = alertSlice.actions;
export default alertSlice.reducer;
