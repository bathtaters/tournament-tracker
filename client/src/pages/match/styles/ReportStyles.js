import React from "react";

export function ReportTitleStyle({ children }) {
  return (
    <h3 className="font-light text-accent-content text-center mb-4">{children}</h3>
  );
}

export const reportStyles = {
  form: "grid grid-cols-3 grid-flow-row gap-1 items-center my-8 max-w-xs",
  wins: "text-lg sm:text-xl font-medium mx-2 text-right",
  drop: "text-xs font-thin mx-2",
  draw: "text-lg sm:text-xl font-light mx-2 text-right",
  dropInput: "ml-1 toggle-accent toggle-sm sm:toggle-md",
}