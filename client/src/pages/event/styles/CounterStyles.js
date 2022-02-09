import React from "react";

export function DrawsStyle({ hidden, children }) {
  return (
    <div className={'text-center w-full font-light text-xs base-color -mt-1'+(hidden ? ' invisible' : '')}>
      {children}
    </div>
  );
}

export function WinsStyle({ children }) {
  return (
    <div className="flex justify-evenly text-center base-color mb-2">{children}</div>
  );
}

export function ByeStyle({ children }) {
  return <div className="pos-color italic font-thin">{children}</div>
}

// Get Win Counter class from matchData
export const winClass = (wins, isEditing, {maxwins, isbye}) => 
  'text-base'+
  (isEditing || !isbye ? '' : ' invisible')+
  (wins && wins === maxwins ? ' pos-color' : '');