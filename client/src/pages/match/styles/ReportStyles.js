import React from "react";

export const ReportStyle = ({ children }) => <div className="min-w-48">{children}</div>

export function ReportTitleStyle({ children }) {
  return (
    <h3 className="font-light text-center mb-4">{children}</h3>
  );
}

export function IncompleteStyle() {
  return <div className="opacity-70 italic font-thin">TBD</div>
}

export const reportStyles = {
  form: "grid grid-cols-4 grid-flow-row gap-1 items-center my-8 max-w-md m-auto",
  wins: "text-lg sm:text-xl font-medium mx-2 justify-end text-base-content",
  drop: "label mx-1 sm:mx-4 justify-start",
  draw: "text-lg sm:text-xl font-light mx-2 justify-end",
  counterWrappers: "col-span-2",
  dropLabel: "text-sm font-light mx-2",
  dropInput: "ml-1 toggle-accent toggle-sm sm:toggle-md",
}