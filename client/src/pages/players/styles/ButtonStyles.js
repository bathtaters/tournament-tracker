import React from "react";
import EyeIcon from "../../common/icons/EyeIcon";

function ButtonBase({ onClick, value, disabled }) {
  return (
    <input
      type="button"
      className="join-item btn btn-primary btn-square btn-md font-bold"
      onClick={onClick}
      value={value}
      disabled={disabled}
    />
  );
}

export function AddButton({ disabled, onClick }) {
  return <ButtonBase value="＋" disabled={disabled} onClick={onClick} />;
}

export function RemoveButton({ canDelete, onClick }) {
  return <ButtonBase value={canDelete ? "✕" : "－"} onClick={onClick} />;
}

export function ShowHiddenButton({ value, onClick }) {
  return (
    <label
      onClick={onClick}
      className={
        "join-item btn btn-neutral btn-square btn-md p-1 swap" +
        (value ? " swap-active" : "")
      }
    >
      <EyeIcon className="swap-on w-full" isOpen={true} />
      <EyeIcon className="swap-off w-full" isOpen={false} />
    </label>
  );
}
