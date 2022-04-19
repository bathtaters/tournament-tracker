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
    <div className="flex justify-evenly text-center text-base-content mb-2">{children}</div>
  );
}

export function ByeStyle({ children }) {
  return <div className="text-success italic font-thin">{children}</div>
}

// Get Win Counter class from matchData
export const winClass = (wins, isEditing, {maxwins, isbye}) => 
  'text-base'+
  (isEditing || !isbye ? '' : ' invisible')+
  (!isEditing && wins && wins === maxwins ? ' text-success' : '');