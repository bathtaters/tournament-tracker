import React from "react";

export function RoundButton({ value, onClick }) {
  return (
    <div className="text-center my-4">
      <input
        disabled={!onClick}
        onClick={onClick}
        type="button"
        value={value}
        className="btn btn-primary btn-wide btn-md sm:btn-lg"
      />
    </div>
  );
}

export function EditEventButton({ onClick }) {
  return (
    <div className="text-center my-6">
      <input
        className="btn btn-secondary btn-outline btn-xs sm:btn-sm font-light"
        onClick={onClick}
        type="button"
        value="Edit Settings"
      />
    </div>
  );
}
