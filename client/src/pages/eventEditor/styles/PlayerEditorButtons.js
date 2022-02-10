import React from "react";

export function PlayerRowButton({ disabled, onClick }) {
  if (disabled) return (<span className="mx-1">•</span>);
  return (
    <input
      className="my-1 mx-2 text-xs font-light px-0"
      type="button"
      value="–"
      onClick={onClick}
    />
  );
}

export function PlayerAddButton({ onClick }) {
  return (
    <input
      className="my-1 mx-2 text-xs font-light px-0"
      type="button"
      value="+"
      onClick={onClick}
    />
  );
}

export function PlayerFillButton({ onClick, size, hidden }) {
  return (
    <input 
      className={
        "my-1 mx-8 w-24 text-sm font-light"
        + (hidden ? " hidden" : "")
      }
      type="button"
      value={"Random "+size}
      onClick={onClick}
    />
  );
}