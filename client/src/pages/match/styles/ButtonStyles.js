import React from "react";
import CancelIcon from "../../common/icons/Cancelcon";

export function ReportButton({ disabled, onClick }) {
  return (
    <input
      className="btn btn-accent btn-sm font-light mt-1"
      disabled={disabled}
      onClick={onClick}
      type="button"
      value="Report"
    />
  );
}

export function ClearReportButton({ onClick }) {
  return (
    <button
      className="absolute bottom-0 right-0 btn btn-ghost btn-circle btn-xs w-4 h-4 min-h-0 m-0.5"
      type={"button"} onClick={onClick}
    >
      <CancelIcon className="w-10/12 h-10/12 fill-error" />
    </button>
  );
}

export function DropButton({ onClick, isDrop }) {
  return (
    <input
      className={"btn btn-xs w-full " + (isDrop ? 'btn-secondary' : 'btn-error')}
      value={ isDrop ? 'Join' : 'Drop' }
      type="button" onClick={onClick}
    />
  )
}