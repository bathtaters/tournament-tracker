import React from "react";

export function ReportButton({ disabled, onClick }) {
  return (
    <input
      className="block text-xs font-light neg-color mt-1"
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
      className="text-red-500 absolute bottom-0 right-1 text-xs font-thin cursor-pointer hover:neg-color"
      onClick={onClick}
    >
      ∅
    </div>
  );
}