import React from "react";

export function RoundButton({ value, onClick }) {
  return (
    <div className="text-center my-4">
      <input
        disabled={!onClick}
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
