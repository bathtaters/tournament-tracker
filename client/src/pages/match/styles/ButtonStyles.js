import React from "react";

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
    <div
      className="text-red-500 absolute bottom-0 right-1 text-xs font-thin cursor-pointer hover:text-error"
      onClick={onClick}
    >
      ∅
    </div>
  );
}

export function DropButton({ onClick, isDrop }) {
  return (
    <div className="link link-hover link-secondary text-center font-light p-0.5 pointer-events-auto" onClick={onClick}>
      { isDrop ? 'Undrop' : 'Drop' }
    </div>
  )
}