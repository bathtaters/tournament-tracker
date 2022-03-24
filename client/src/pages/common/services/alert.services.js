import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openAlert, closeAlert } from "../../../core/store/alertSlice";

// Filter for user input when opening new alert
const optionFilter = ({ message, buttons = ["Ok"], title, className = "" }) => ({ message, buttons, title, className })


// --- PUBLIC HOOKS --- \\

// Hook returning function to open alert
export function useOpenAlert() {
  const dispatch = useDispatch()
  return useCallback(
    (options) => dispatch(openAlert(optionFilter(options))).unwrap(),
    [openAlert]
  )
}

// Hook returning function to force alert to close
export function useCloseAlert() {
  const dispatch = useDispatch()
  return useCallback((result) => dispatch(closeAlert(result)), [closeAlert])
}

// Hook returning function to get alert open/close status (True = Open)
export const useAlertStatus = () => useSelector((state) => state.alert.isOpen)

// Hook returning function to get result of last-closed alert
export const useAlertResult = () => useSelector((state) => state.alert.result)

// Simple then function for openAlert, returns True/False
export function isResult({ buttons }, buttonIndex) {
  const expected = getReturnValue(buttons[buttonIndex])
  return (result) => result && result === expected
}

// --- INTERNAL FUNCTIONS --- \\

const getReturnValue = (button) => typeof button === 'string' ? button :
  typeof button.onClick === 'string' ? button.onClick : button.value || button.id || button.label || null

// Convert button data to props on input tag
export function getButtonProps(data, close, idx) {
  // If button data is string
  if (typeof data === 'string') return { value: data, onClick: () => close(data), key: data }

  // Catch illegal button data types
  if (typeof data !== 'object') throw new Error("Invalid alert button: "+JSON.stringify(data))

  // If button data is object
  return {
    ...data, // all other values include as-is

    // React key for button is ID => Label => Value => Index
    key: data.id || data.label || data.value || idx,

    // Button text is Label => Value => ID => "?"
    value: data.label || data.value || data.id || '?',

    // Button action is onClick(event, data) => closeWith(onClick<string> => data[Value => ID => Label] => NULL)
    onClick:
      typeof data.onClick === 'function' ? (ev) => data.onClick(ev, close, data) :
      typeof data.onClick === 'string'   ? () => close(data.onClick) :
        () => close(data.value || data.id || data.label || null),
  }
}