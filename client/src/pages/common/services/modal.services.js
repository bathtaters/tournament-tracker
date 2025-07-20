import { useCallback, useState } from "react";
import { modalCloseAlert } from "../../../assets/alerts";
import { useOpenAlert } from "../common.hooks"

/** This must be implemented upstream of Modal.
 *  - Params:
 *    - `startOpen?` - If true Modal is opened on page load
 *    - `startLocked?` - If true Modal is locked when it opens
 *    - `lockAlert?` - Partial alert object to use when exiting a locked modal,
 *        - `title: string?` - Header of alert
 *        - `message: string?` - Body of alert
 *        - `buttons: [object|string]` - Alert buttons, format: ["Close", { value: "Back", className: "btn-info" }], // [0]=Y
 *        - `className: string` - Class to add to Alert
 *  - Returns:
 *    - `backend: object` - Opaque object that should be passed to Modal
 *    - `open()` - Function to open modal
 *    - `close(overrideLock?)` - Function to close modal, with option to override the lock
 *    - `setLock(isLocked)` - Function to set the lock state (React useState function)
 */
export default function useModal(startOpen = false, startLocked = false, lockAlert = undefined) {
  const openAlert = useOpenAlert()
  const [isOpen, setOpen] = useState(startOpen)
  const [isLocked, setLock] = useState(startLocked)

  const lock = useCallback((lock = true) => setLock(lock), [])

  const open = useCallback(() => setOpen(true), [])

  const close = useCallback((overrideLock = false) => {
    if (!overrideLock && isLocked) return;
    setOpen(false)
    setLock(startLocked)
  }, [isLocked, startLocked])

  const closeWithMsg = useCallback(() => {
    if (!isLocked) return close(true)
    return openAlert(modalCloseAlert(lockAlert), 0)
      .then(r => r && close(true))
  }, [close, isLocked, lockAlert, openAlert])

  return {
    open, close, lock,
    backend: { isOpen, isLocked, close, closeWithMsg }
  }
}
