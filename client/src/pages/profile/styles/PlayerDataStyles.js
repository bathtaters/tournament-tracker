import React from "react";

// BUTTONS
export function EditButton({ value, onClick }) {
  return (<span className="link link-hover link-primary" onClick={onClick}>{value}</span>);
}

// STYLES
export function LabelStyle({ id, children }) {
  return (
    <label className="label mx-2" htmlFor={id}>
      <h4 className="label-text text-right text-lg font-thin w-full">{children}</h4>
    </label>
  );
}

export function InputStyle(props) {
  return (<input className="input input-sm input-primary col-span-2 w-full" {...props} />);
}

export function ButtonsStyle({ children }) {
  return (<div className="text-left font-light text-xs ml-1">{children}</div>);
}