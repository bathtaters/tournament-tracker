import React from "react";
import { NavLink } from "react-router-dom";

export function HeaderStyle({ children }) {
  return (<div className="navbar bg-base-300 sm:h-24 justify-center"><div className="navbar-center w-full max-w-6xl">{children}</div></div>)
}

export function TitleStyle({ title }) {
  return (
    <h3 className="text-primary font-medium flex-1 px-2 sm:ml-2 line-clamp-2 text-ellipsis overflow-hidden">
      {title}
    </h3>
  );
}

export const settingsClass = "btn btn-ghost btn-md text-xl sm:text-2xl px-1"

export const reloadClass = {
  loading: "text-secondary pointer-events-none animate-spin ease-linear",
  button:  "text-secondary cursor-pointer hover:text-secondary-focus",
}

export function LinkContainer({ children }) {
  return (<div className="flex-none"><ul className="menu menu-horizontal p-0">{children}</ul></div>);
}

export function LinkStyle({ to, text }) {
  return (<li className="mx-1"><NavLink to={to}>{text}</NavLink></li>);
}

export function OverlayStyle({ edge = "right", spacing = "1", children }) {
  return (<div className={`absolute -top-2 ${edge}-0 z-50 m-${spacing} overflow-hidden`}>{children}</div>);
}