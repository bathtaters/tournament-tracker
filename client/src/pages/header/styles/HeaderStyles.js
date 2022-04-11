import React from "react";
import { NavLink } from "react-router-dom";

export function HeaderStyle({ children }) {
  return (
    <div className="h-28"> {/* Spacing underneath header */}

      <div className="fixed top-0 z-40 w-full alt-bgd bg-opacity-90 h-24 p-2 flex justify-around items-center px-2">
        {children}
      </div>

    </div>
  );
}

export function TitleStyle({ title }) {
  return (
    <h3 className="base-color font-medium text-center px-2 line-clamp-2 text-ellipsis overflow-hidden">
      {title}
    </h3>
  );
}

export function LinkStyle({ to, text }) {
  return (<h4><NavLink to={to}>{text}</NavLink></h4>);
}

export function OverlayStyle({ edge = "left", spacing = "2", children }) {
  return (<div className={`absolute top-0 ${edge}-0 z-50 m-${spacing}`}>{children}</div>);
}