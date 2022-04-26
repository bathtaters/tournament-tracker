import React from "react";
import { PageTitleStyle } from "../../common/styles/CommonStyles";

export function HeaderStyle({ children }) {
  return (<div className="flex justify-evenly items-center">{children}</div>);
}

export const TitleStyle = ({ children }) => PageTitleStyle({ className: "inline-block", children });

export function DaysContainerStyle({ children }) {
  return (<div className="flex flex-wrap justify-center mt-4">{children}</div>);
}

export function HeaderButton({ children, disabled, onClick }) {
  return (
    <button
      className="btn btn-primary btn-sm sm:btn-md"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export const dayClass = {
  past:   { titleCls: "text-base-content",                      borderCls: "border-base-content" },
  today:  { titleCls: "text-accent-content dark:text-accent",   borderCls: "border-accent"       },
  future: { titleCls: "text-primary dark:text-primary-content", borderCls: "border-primary"      },
};