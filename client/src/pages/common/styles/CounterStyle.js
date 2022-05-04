import React from "react";

export default function CounterStyle({ className, onClick, children }) {
  return (
    <span className={'btn select-none '+className} onClick={onClick} unselectable="on">
      {children}
    </span>
  );
}