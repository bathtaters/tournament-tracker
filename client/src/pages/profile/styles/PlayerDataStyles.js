import React from "react";

// BUTTONS
export function EditButton({ value, isEditing = true, onClick, disabled }) {
  return (
    <button
      type="button"
      className={"join-item btn btn-primary btn-sm text-xs font-light z-10 lowercase"+(isEditing ? "" : " btn-outline")}
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}

// STYLES
export function LabelStyle({ id, children }) {
  return (
    <label className="label justify-end font-light w-full" htmlFor={id}>
      {children}
    </label>
  );
}

export function InputGroupStyle({ children }) {
  return <div className="join">{children}</div>
}

export function SelectOptionStyle({ type, optionClass, ...props  }) {
  return (
    <select
      className="join-item select select-sm select-primary grow disabled:opacity-100 disabled:cursor-text"
      {...props}
    >
      {Object.entries(type).map(([key,val]) => (
        <option key={val} value={key} className={optionClass}>{val}</option>
      ))}
    </select>
  )
}

export function InputStyle({ on = 'ON', off = 'OFF', ...props }) {
  if (Array.isArray(props.type)) return <SelectOptionStyle {...props} />

  if (props.type === 'toggle') return (
    <label disabled={props.disabled} className={
      "swap justify-start z-0 join-item input input-sm input-primary grow disabled:opacity-100 disabled:cursor-text"
      + (props.value ? ' swap-active' : '')
    }>
      <input {...props} type="checkbox" />
      <div className="swap-on">{on}</div>
      <div className="swap-off">{off}</div>
    </label>
  )

  return (
    <input
      className="join-item input input-sm input-primary grow disabled:opacity-100 disabled:cursor-text"
      {...props}
    />
  )
}