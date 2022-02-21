import React from "react";
import { Link } from "react-router-dom";

export function HeaderStyle({ label }) {
  const labelSize = label.length === 3 ? 'text-xs sm:text-xl' : 'text-xl';
  return (
    <div className={'font-normal mb-2 text-center ' + labelSize}>
      {label}
    </div>
  );
}

export function CellStyle({ indexStyle, titleStyle, children }) {
  const {size,color,weight,align} =
    indexStyle ?
      { size: 'base', color: 'dim',  weight: 'light',  align: 'right'  } :
    titleStyle ?
      { size: 'lg',   color: 'max',  weight: 'light',  align: 'left'   } :
    // Default
      { size: 'sm',   color: 'base', weight: 'thin',   align: 'center' } ;

  return (
    <div className={`text-${size} font-${weight} text-${align} ${color}-color`}>
      {children}
    </div>
  );
}

export function OverlayRowStyle({ to, onClick, className = '' }) {
  return (
    <Link
      className={`w-full h-full px-2 bg-opacity-0 base-bgd-inv ${className} hover:bg-opacity-25`}
      to={to} onClick={onClick}
    />
  );
}