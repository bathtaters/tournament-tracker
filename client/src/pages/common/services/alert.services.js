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
    (options, expectedIndex = null) => {
      const expected = typeof expectedIndex === 'number' && getReturnValue(options.buttons[expectedIndex], expectedIndex)
      return dispatch(openAlert(optionFilter(options))).unwrap().then((result) => expected ? result === expected : result)
    },
    [dispatch]
  )
}

// Hook returning function to force alert to close
export function useCloseAlert() {
  const dispatch = useDispatch()
  return useCallback((result) => dispatch(closeAlert(result)), [dispatch])
}

// Hook returning function to get alert open/close status (True = Open)
export const useAlertStatus = () => useSelector((state) => state.alert.isOpen)

// Hook returning function to get result of last-closed alert
export const useAlertResult = () => useSelector((state) => state.alert.result)


// --- INTERNAL FUNCTIONS --- \\

export const breakMessage = (message) => <>{message.split('\n').map((line,idx) => <div key={idx}>{line}</div>)}</>

const getReturnValue = (button, idx) => typeof button === 'string' ? button :
  typeof button.onClick === 'string' ? button.onClick : button.value || button.id || button.label || idx

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
      typeof data.onClick === 'function' ? (ev) => data.onClick(ev, close, data) : () => close(getReturnValue(data, idx)),
  }
}