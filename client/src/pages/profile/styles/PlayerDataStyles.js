import React from "react";

// BUTTONS
export function EditButton({ value, isEditing = true, onClick }) {
  return (
    <button type="button" className={"btn btn-primary btn-sm text-xs font-light lowercase"+(isEditing ? "" : " btn-outline")} onClick={onClick}>
      {value}
    </button>
  )
}

// STYLES
export function LabelStyle({ id, children }) {
  return (
    <label className="label w-full" htmlFor={id}>
      <h4 className="label-text text-lg font-thin w-full text-right">{children}</h4>
    </label>
  );
}

export function InputGroupStyle({ children }) {
  return <div className="input-group input-group-sm flex">{children}</div>
}

export function SelectOptionStyle({ type, optionClass, ...props  }) {
  return (
    <select
      className="select select-sm select-primary select-bordered flex-grow min-w-0 disabled:opacity-100 disabled:cursor-text"
      {...props}
    >
      {Object.entries(type).map(([key,val]) => (
        <option key={val} value={key} className={optionClass}>{val}</option>
      ))}
    </select>
  )
}

export function InputStyle(props) {
  if (Array.isArray(props.type)) return <SelectOptionStyle {...props} />

  return (
    <input
      className="input input-sm input-primary input-bordered flex-grow min-w-0 disabled:opacity-100 disabled:cursor-text"
      {...props}
    />
  )
}