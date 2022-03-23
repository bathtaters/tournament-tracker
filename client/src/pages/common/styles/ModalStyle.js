import React from "react";

// Classes to pass to Overlay component
export const overlayClasses = "p-8 flex justify-center items-center";

// Modal window style
function ModalStyle({ className, children }, ref) {
  return (
    <div className={`relative max-h-full overflow-auto p-8 alt-bgd shadow-lg rounded-lg ${className}`} ref={ref}>
      {children}
    </div>
  )
}

// Close Button
export function CloseButton({ onClick }) {
  return (<input
    type="button"
    value="x"
    aria-label="Close"
    onClick={onClick}
    className="absolute top-0 right-0 m-1 border-0"
  />);
}

export default React.forwardRef(ModalStyle); // Must use fwdRef for FocusTrap