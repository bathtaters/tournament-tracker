import React from "react";
import scheduleRows from "../playerEvents.layout";

export const scheduleGridClass = `grid-cols-${scheduleRows.reduce((c,r) => c + (r.span || 1),0)}`;

export function WrapperStyle({ title, children }) {
  return (
    <div className="my-4">
      <h3 className="dim-color mt-4 font-thin">{title}</h3>
      {children}
    </div>
  );
}

export function GridStyle({ children }) {
  return (
    <div className={'grid grid-flow-row gap-x-2 gap-y-1 mx-4 ' + (scheduleGridClass)}>
      {children}
    </div>
  );
}