import React from "react"

export function ListRowButton({ disabled, onClick }) {
  if (disabled) return (<span className="mx-1">⏺</span>);
  return (
    <input
      className="btn btn-circle btn-error btn-xs my-1 mx-2 text-xs"
      type="button"
      value="–"
      onClick={onClick}
    />
  )
}

export function ListAddButton({ onClick }) {
  return (
    <input
      className="btn btn-circle btn-success btn-xs mx-2 my-2 text-xs"
      type="button"
      value="+"
      onClick={onClick}
    />
  )
}

export function ListFillButton({ onClick, onFirstEdit, label = 'Autofill', hidden }) {
  return (
    <button 
      className={`btn btn-secondary btn-outline btn-sm my-1 mx-8 w-24 text-sm font-light${hidden ? " hidden" : ""}`}
      onClick={(ev) => { onFirstEdit && onFirstEdit(); onClick(ev) }}
      type="button"
    >
      {label}
    </button>
  )
}