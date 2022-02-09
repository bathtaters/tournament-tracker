import React from "react";

export function ReportTitleStyle({ children }) {
  return (
    <h3 className="font-light max-color text-center mb-4">{children}</h3>
  );
}

export const reportStyles = {
  form: "grid grid-cols-3 grid-flow-row gap-2 items-center my-8",
  wins: "text-base sm:text-xl font-medium mx-2 text-right",
  drop: "ml-1 dim-color",
  draw: "text-base sm:text-xl font-light mx-2 text-right",
  dropInput: "text-xs sm:text-base font-thin mx-2",
}