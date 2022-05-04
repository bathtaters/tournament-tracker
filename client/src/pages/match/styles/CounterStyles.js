import React from "react";

export function DrawsStyle({ hidden, children }) {
  return (
    <div className={'text-center w-full font-light text-xs text-base-content -mt-1'+(hidden ? ' invisible' : '')}>
      {children}
    </div>
  );
}

export function WinsStyle({ children }) {
  return (
    <div className="flex justify-evenly text-center text-base-content mb-1">{children}</div>
  );
}

export function ByeStyle({ children }) {
  return <div className="text-success italic font-thin">{children}</div>
}

// Get Win Counter class from matchData
export const winClass = (wins, isEditing, {maxwins, isbye}) => 
  'text-base h-6' + (
    isEditing ? ' btn-primary btn-circle btn-xs' :
    isbye ? ' invisible' :
    wins && wins === maxwins ? ' text-success' : ''
  );

export const drawsClass = (isEditing) => 'font-light lowercase min-h-0 h-4 ' +
  (isEditing ? 'btn-primary btn-xs rounded-xl' : '');