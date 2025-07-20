import React from "react";

export function PlayerRowButton({ disabled, onClick }) {
  if (disabled) return <span className="mx-1">•</span>;
  return (
    <input
      className="btn btn-circle btn-error btn-xs my-1 mx-2 text-xs"
      type="button"
      value="–"
      onClick={onClick}
    />
  );
}

export function PlayerAddButton({ onClick }) {
  return (
    <input
      className="btn btn-circle btn-success btn-xs mx-2 my-2 text-xs"
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
        "btn btn-secondary btn-outline btn-sm my-1 mx-8 w-24 text-sm font-light" +
        (hidden ? " hidden" : "")
      }
      type="button"
      value={"Random " + size}
      onClick={onClick}
    />
  );
}
