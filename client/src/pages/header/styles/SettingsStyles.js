import React from "react";

export function TitleStyle({ children }) {
  return (<h3 className="font-light max-color text-center mb-2">{children}</h3>);
}

export function ResetButtonStyle({ children }) {
  return (<div className="text-center mt-4">{children}</div>);
}
