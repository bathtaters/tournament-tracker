import React from "react";

export function WrapperStyle({ children }) {
  return (<span className="inline-block relative p-1">{children}</span>);
}

export function BoxStyle({ children }) {
  return (
    <div className="absolute left-0 z-50 right-0 top-auto max-h-screen bg-red-500">
      <div className="fixed border dim-border shadow-lg overflow-auto max-h-24 w-full">
        <ul>{children}</ul>
      </div>
    </div>
  );
}

export function EntryStyle({ className, isSelected, children }) {
  const selectClass = isSelected ? " base-bgd-inv base-color-inv" : "";

  return (
  <li className={"base-bgd dim-color py-0.5 px-2 w-full " + className + selectClass}>
    {children}
  </li>
  );
}