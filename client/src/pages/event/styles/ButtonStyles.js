import React from "react";
import SettingsIcon from "../components/subcomponents/SettingsIcon";

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
  )
}

export function EditEventButton({ onClick }) {
  return (
    <div class="stat-figure">
      <button type="button" className="btn btn-secondary" onClick={onClick}>
        <SettingsIcon />
      </button>
    </div>
  )
}
