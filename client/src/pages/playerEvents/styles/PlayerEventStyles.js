import React from "react";

export function WrapperStyle({ title, children }) {
  return (
    <div className="my-4">
      <h3 className="dim-color mt-4 font-thin">{title}</h3>
      {children}
    </div>
  );
}
