import React from "react";
import { NavLink } from "react-router-dom";

export function HeaderStyle({ children }) {
  return (<>
    <div className="fixed top-0 left-0 right-0 z-50 bg-base-200 bg-opacity-90">
      <div className="navbar h-24 sm:h-36 max-w-4xl m-auto">
        {children}
      </div>
    </div>
    <div className="h-24 sm:h-36" />
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


export function MenuStyle({ children }) {
  return (
    <ul className="menu menu-compact dropdown-content p-2 shadow bg-base-300 rounded-box w-52">
      {children}
    </ul>
  )
}

export function MenuItemStyle({ children }) {
  return (<li className="mx-1"><h4 className="w-full text-xl sm:text-2xl block">{children}</h4></li>);
}

export function MenuLinkStyle({ to, text }) {
  return (
    <MenuItemStyle>
      <NavLink className="block" to={to}>{text}</NavLink>
    </MenuItemStyle>
  );
}

export const headerButtonStyle = "btn btn-ghost btn-circle"

export const reloadingClass = "animate-spin ease-linear"