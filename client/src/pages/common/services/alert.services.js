import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openAlert, closeAlert } from "../../../core/store/alertSlice";

export function useOpenAlert() {
  const dispatch = useDispatch()
  return useCallback(
    (message, buttons = ["Ok"], title) => dispatch(openAlert({ message, buttons, title })).unwrap(),
    [openAlert]
  )
}

export function useCloseAlert() {
  const dispatch = useDispatch()
  return useCallback((result) => dispatch(closeAlert(result)), [closeAlert])
}

export const useAlertStatus = () => useSelector((state) => state.alert.isOpen)
export const useAlertResult = () => useSelector((state) => state.alert.result)