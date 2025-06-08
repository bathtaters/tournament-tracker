import React from "react";
import { NavLink } from "react-router-dom";

export function DropdownStyle({ isRight, children }) {
  return (
    <div className={`${isRight ? "navbar-end" : "navbar-start"} shrink-0 w-auto`}>
      <div className={`dropdown dropdown-hover ${isRight ? "dropdown-end" : "dropdown-start"}`}>
        {children}
      </div>
    </div>
  );
}

export function MenuStyle({ onSubmit, children }) {
  return (
    <form onSubmit={onSubmit}>
      <ul tabIndex="0" className="dropdown-content menu p-2 shadow-sm bg-base-300 rounded-box w-52">
        {children}
      </ul>
    </form>
  )
}

export function MenuItemStyle({ lessPadding, disabled, children }) {
  return (
    <li className={`px-1${disabled ? ' menu-disabled' : ''}`}>
      <h4 className={`w-full text-xl sm:text-2xl block${lessPadding ? ' p-1 bg-ignore' : ''}`}>
        {children}
      </h4>
    </li>
  )
}

export function MenuLinkStyle(props) {
  return (
    <MenuItemStyle>
      <NavLink className="flex flex-row justify-between items-center" {...props} />
    </MenuItemStyle>
  );
}

export const headerButtonStyle = "btn btn-ghost btn-circle mask mask-circle"