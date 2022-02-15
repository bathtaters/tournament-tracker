import React from "react";

// BUTTONS
export function EditButton({ value, onClick }) {
  return (<span className="link" onClick={onClick}>{value}</span>);
}

// STYLES
export function LabelStyle({ children }) {
  return (<h4 className="text-right base-color font-thin">{children}</h4>);
}

export function InputStyle({ children }) {
  return (<h4 className="base-color col-span-2 w-full">{children}</h4>);
}

export function ButtonsStyle({ children }) {
  return (<div className="text-left font-light text-xs">{children}</div>);
}