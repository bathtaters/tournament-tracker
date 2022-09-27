import React from "react";
import { NavLink } from "react-router-dom";

export function HeaderStyle({ children }) {
  return (<>
    <div className="fixed top-0 left-0 right-0 z-50 bg-base-200 bg-opacity-90">
      <div className="navbar h-16 sm:h-24 max-w-4xl m-auto">
        {children}
      </div>
    </div>
    <div className="h-16 sm:h-24" />
  </>)
}

export function DropdownStyle({ children }) {
  return <div className="navbar-start flex-shrink-0 w-auto"><div className="dropdown dropdown-hover">{children}</div></div>
}

export function TitleStyle({ children }) {
  return (
    <div className="navbar-center flex-auto h-full">
      <h3 className="text-primary dark:text-primary-content font-medium m-auto px-2 text-center line-clamp-2 leading-none text-ellipsis overflow-hidden h-full">
        {children}
      </h3>
    </div>
  );
}

export function ReloadStyle({ children }) {
  return (<div className="navbar-end flex-shrink-0 w-auto">{children}</div>);
}

export function MenuStyle({ children }) {
  return (
    <ul className="menu menu-compact dropdown-content p-2 shadow bg-base-300 rounded-box w-52">
      {children}
    </ul>
  )
}

export function LinkStyle({ to, text }) {
  return (<li className="mx-1"><NavLink to={to}><h4 className="w-full text-xl sm:text-2xl">{text}</h4></NavLink></li>);
}

export const headerButtonStyle = "btn btn-ghost btn-circle"

export const reloadingClass = "animate-spin ease-linear"