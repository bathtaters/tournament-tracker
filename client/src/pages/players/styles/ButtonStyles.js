import React from "react";

function ButtonBase({ onClick, value, disabled }) {
  return (<input
    type="button"
    className="m-2 p-lg"
    onClick={onClick}
    value={value}
    disabled={disabled}
  />);
}

export function AddButton({ disabled, onClick }) {
  return (<ButtonBase value="+" disabled={disabled} onClick={onClick} />)
}

export function RemoveButton({ canDelete, onClick }) {
  return (<ButtonBase value={canDelete ? 'x' : '–'} onClick={onClick} />)
}