import React from "react";

function OverlayContainer({ children, onClick, className = '', z = 5 }) {
  if (z > 5) console.warn('WARNING: Invalid z-level for overlay:',z);
  // const clickHandle = (ev) => { console.log('BGD Click: ',!!onClick); if (onClick) onClick(ev); }
  return (
    <div className={`fixed top-0 left-0 z-${z * 10} w-screen h-screen ${className}`}>
      <div className="absolute w-full h-full base-bgd bg-opacity-50" onClick={onClick} />
      {children}
    </div>
  )
}

export default OverlayContainer;