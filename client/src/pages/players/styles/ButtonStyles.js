import React from "react";

function ButtonBase({ onClick, value, disabled }) {
  return (<input
    type="button"
    className="m-2 btn btn-primary btn-square btn-md font-bold"
    onClick={onClick}
    value={value}
    disabled={disabled}
  />);
}

export function AddButton({ disabled, onClick }) {
  return (<ButtonBase value="＋" disabled={disabled} onClick={onClick} />)
}

export function RemoveButton({ canDelete, onClick }) {
  return (<ButtonBase value={canDelete ? '✕' : '－'} onClick={onClick} />)
}