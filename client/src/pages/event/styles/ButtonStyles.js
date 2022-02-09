import React from "react";

export function RoundButton({ value, disabled, onClick }) {
  return (
    <div className="text-center my-4">
      <input
        disabled={disabled}
        onClick={onClick}
        type="button"
        value={value}
      />
    </div>
  );
}

export function EditEventButton({ onClick }) {
  return (
    <div className="text-center my-6">
      <input
        className="dim-color font-light"
        onClick={onClick}
        type="button"
        value="Edit Settings"
      />
    </div>
  );
}

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

