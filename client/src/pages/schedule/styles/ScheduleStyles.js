import React from "react";

export function HeaderStyle({ children }) {
  return (<div className="flex justify-evenly items-center">{children}</div>);
}

export function TitleStyle({ children }) {
  return (<h2 className="inline-block text-center font-thin">{children}</h2>);
}

export function DaysStyle({ children }) {
  return (<div className="flex flex-wrap justify-center mt-4">{children}</div>);
}

export function HeaderButton({ value, disabled, onClick }) {
  return (<input
    className="sm:w-20 sm:h-11"
    type="button"
    value={value}
    onClick={onClick}
    disabled={disabled}
  />);
}

export const dayClass = {
  past:   { titleCls: "dim-color-inv", borderCls: "dimmer-border" },
  today:  { titleCls: "max-color",     borderCls: "pos-border"    },
  future: { titleCls: "base-color",    borderCls: "base-border"   },
};