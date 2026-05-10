import {
  createSlice,
  type Middleware,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { type FetchState, isFetching } from "./fetchApi";

const initialState = {
  lockScreen: { isLocked: false } as {
    isLocked: boolean;
    caption?: string;
  },
};

export const globalSlice = createSlice({
  name: "global",
  initialState: { ...initialState },
  reducers: {
    lockScreen: (state, action: PayloadAction<string>) => {
      state.lockScreen = { isLocked: true, caption: action.payload };
    },
    unlockScreen: (state) => {
      state.lockScreen = { ...initialState.lockScreen };
    },
  },
});

/** If the screen is locked and fetching has ceased, unlock the screen. */
export const globalMiddleware: Middleware =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    const nextRes = next(action);

    const state = getState() as GlobalState;
    if (state.global.lockScreen.isLocked && !isFetching(state))
      dispatch(unlockScreen());
    return nextRes;
  };

export const { lockScreen, unlockScreen } = globalSlice.actions;
export default globalSlice.reducer;

export type GlobalState = FetchState & {
  global: ReturnType<typeof globalSlice.reducer>;
};
