import React from "react";

export default function RawDataStyle({ className, children }) {
  return (
    <div className={"text-center font-thin m-2 text-base-content " + className}>
      {children}
    </div>
  );
}