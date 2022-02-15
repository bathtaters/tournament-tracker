import React from "react";
import { layoutTemplate } from "../services/stats.services";

export function StatsStyle({ children }) {
  return (<div className="relative">{children}</div>);
}

export function GridStyle({ layoutArray, className = '', children }) {
  return (
    <div
      className={"grid grid-flow-row gap-x-2 gap-y-1 items-center px-4 py-2 "+className}
      style={{ gridTemplateColumns: layoutTemplate(layoutArray) }}
    >
      {children}
    </div>
  );
}

export function OverlayStyle({ children }) {
  return (
    <div
      className="grid grid-flow-row grid-cols-1 gap-x-2 gap-y-1 py-2 items-center absolute top-0 left-0 right-0 bottom-0 z-0"
    >
      <div className="w-full h-full opacity-75 mb-2 bg-none" />
      {children}
    </div>
  )
}