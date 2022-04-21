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
      className="text-error absolute bottom-0 right-1 text-xs font-thin cursor-pointer hover:text-error"
      onClick={onClick}
    >
      ∅
    </div>
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