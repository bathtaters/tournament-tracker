import React from "react";
import EditIcon from "../../common/icons/EditIcon";

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
    <div className="stat-figure">
      <button type="button" className="btn btn-secondary btn-sm btn-square" onClick={onClick}>
        <EditIcon className="h-4 w-4 stroke-current" />
      </button>
    </div>
  )
}
