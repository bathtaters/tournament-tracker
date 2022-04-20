import React from "react";

// Modal window style (fwdRef for FocusTrap)
export const ModalStyle = React.forwardRef(function ModalStyle({ className, onClick, z = 'z-70', children }, ref) {
  return (
    <div className={`modal modal-open modal-bottom sm:modal-middle ${z}`} onClick={onClick} ref={ref}>
      <div className={`modal-box bg-base-200 relative p-8 max-w-3xl ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
})

// Close Button
export function CloseButton({ onClick }) {
  return (<input
    type="button"
    value="✕"
    aria-label="Close"
    onClick={onClick}
    className="btn btn-ghost btn-circle btn-sm focus-visible:outline-none focus-visible:bg-neutral-500/30 absolute top-0 right-0"
    />);
}