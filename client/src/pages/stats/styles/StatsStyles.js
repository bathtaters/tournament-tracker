import React from "react";
import { layoutTemplate } from "../services/stats.services";
import { HeaderStyle } from "./InnerStyles";

export function StatsStyle({ children }) {
  return (<div className="relative overflow-auto min-w-max">{children}</div>);
}

const gridBase = "grid grid-flow-row gap-y-1 py-2"

export function GridStyle({ layoutArray, className = '', children }) {
  return (
    <div
      className={gridBase + " gap-x-2 px-4 items-center " + className}
      style={{ gridTemplateColumns: layoutTemplate(layoutArray) }}
    >
      {children}
    </div>
  );
}

export function OverlayStyle({ className = '', children }) {
  return (
    <div className={gridBase + " grid-cols-1 absolute top-0 left-0 right-0 bottom-0 z-0 " + className}>
      <HeaderStyle label=" " />
      {children}
    </div>
  )
}

export function MissingStyle({ colCount = 1, children }) {
  return (<div className={`italic dim-color text-center font-thin col-span-${colCount}`}>{children}</div>)
}