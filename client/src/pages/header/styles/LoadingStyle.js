import React from "react";

// Create rotating ring effect
function LoadingStyle({ size = 4, weight = 4, hideBgd = false, color = '#3498db', className = '' }) {
  return (
    <div style={{borderTopColor: color}} className={
      'loader ease-linear rounded-full dimmer-border ' +
      `border-${hideBgd ? 0 : weight} border-t-${weight} ` +
      `h-${size} w-${size} sm:h-${size+2} sm:w-${size+2}` +
      className
    } />
  )
}

export default LoadingStyle;