import type { AlertOptions, AlertState, OpenAlertFunction } from "types/base";
import type { AppDispatch, RootState } from "../../core/store/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeAlert, openAlert } from "../../core/store/alertSlice";

// Filter for user input when opening new alert
const optionFilter = ({
  message,
  buttons = ["Ok"],
  title,
  className = "",
}: AlertOptions): Partial<AlertState> => ({
  message,
  buttons,
  title,
  className,
});

// --- PUBLIC HOOKS --- \\

// Hook returning function to open alert
export function useOpenAlert() {
  const dispatch: AppDispatch = useDispatch();
  return useCallback(
    async (options: AlertOptions, expectedBtnIdx?: number) => {
      const expected =
        typeof expectedBtnIdx === "number"
          ? getReturnValue(options.buttons[expectedBtnIdx], expectedBtnIdx)
          : null;
      const result = await dispatch(openAlert(optionFilter(options))).unwrap();
      return expected ? result === expected : result;
    },
    [dispatch],
  ) as OpenAlertFunction;
}

// Hook returning function to force an open alert to close
export function useCloseAlert() {
  const dispatch: AppDispatch = useDispatch();
  return useCallback(
    (result?: string) => dispatch(closeAlert(result)),
    [dispatch],
  );
}

// Hook returning function to get alert open/close status (True = Open)
export const useAlertStatus = () =>
  useSelector((state: RootState) => state.alert.isOpen);

// Hook returning function to get result of last-closed alert
export const useAlertResult = () =>
  useSelector((state: RootState) => state.alert.result);

// --- INTERNAL FUNCTIONS --- \\

const getReturnValue = (button, idx) =>
  typeof button === "string"
    ? button
    : typeof button.onClick === "string"
      ? button.onClick
      : button.value || button.id || button.label || idx;

// Convert button data to props on input tag
export function getButtonProps(data, close, idx) {
  // If button data is string
  if (typeof data === "string")
    return { value: data, onClick: () => close(data), key: data };

  // Catch illegal button data types
  if (typeof data !== "object")
    throw new Error("Invalid alert button: " + JSON.stringify(data));

  // If button data is an object
  return {
    ...data, // all other values include as-is

    // Button text is Label => Value => ID => "?"
    value: data.label || data.value || data.id || "?",

    // Button action is onClick(event, data) => closeWith(onClick<string> => data[Value => ID => Label] => NULL)
    onClick:
      typeof data.onClick === "function"
        ? (ev) => data.onClick(ev, close, data)
        : () => close(getReturnValue(data, idx)),
  };
}
