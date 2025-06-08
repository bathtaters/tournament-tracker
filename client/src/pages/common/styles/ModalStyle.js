import React from "react";

// Modal window style (fwdRef for FocusTrap)
export const ModalStyle = React.forwardRef(function ModalStyle({ isOpen, className, onClick, z = 'z-70', children }, ref) {
  return isOpen ? (
    <div className={`modal modal-open modal-bottom sm:modal-middle h-full w-full ${z}`} onClick={onClick} ref={ref}>
      <div
        className={`modal-box max-h-full max-w-full sm:overflow-x-hidden relative p-8 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  ) : (
    <div className="opacity-0">{children}</div>
    // Fix for focus-trap-react not having anything to focus in React 19
  )
})

// Close Button
export function CloseButton({ onClick }) {
  return (<input
    type="button"
    value="✕"
    aria-label="Close"
    onClick={onClick}
    className="btn btn-ghost btn-circle btn-sm focus-visible:outline-hidden focus-visible:bg-base-content/20 absolute top-0 right-0"
    />);
}