import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  isFetching: true,
  lockScreen: { isLocked: false } as { isLocked: boolean; caption?: string },
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFetch: (state, action: PayloadAction<boolean>) => {
      state.isFetching = Boolean(action.payload);
      if (!state.isFetching && state.lockScreen.isLocked) {
        state.lockScreen = { ...initialState.lockScreen };
      }
    },
    lockScreen: (state, action: PayloadAction<string>) => {
      state.lockScreen = { isLocked: true, caption: action.payload };
    },
    unlockScreen: (state) => {
      state.lockScreen = { ...initialState.lockScreen };
    },
  },
});

export const { setFetch, lockScreen, unlockScreen } = globalSlice.actions;
export default globalSlice.reducer;
