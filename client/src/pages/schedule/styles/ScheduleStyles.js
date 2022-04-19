import React from "react";
import { PageTitleStyle } from "../../common/styles/CommonStyles";

export function HeaderStyle({ children }) {
  return (<div className="flex justify-evenly items-center">{children}</div>);
}

export const TitleStyle = ({ children }) => PageTitleStyle({ className: "inline-block", children });

export function DaysContainerStyle({ children }) {
  return (<div className="flex flex-wrap justify-center mt-4">{children}</div>);
}

export function HeaderButton({ value, disabled, onClick }) {
  return (<input
    className="btn btn-primary btn-sm sm:btn-md"
    type="button"
    value={value}
    onClick={onClick}
    disabled={disabled}
  />);
}

export const dayClass = {
  past:   { titleCls: "text-base-content", borderCls: "border-base-content" },
  today:  { titleCls: "text-accent",       borderCls: "border-accent"       },
  future: { titleCls: "text-primary",      borderCls: "border-primary"      },
};