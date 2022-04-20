import React from "react";

export const overlayStyle = "flex justify-center items-center"

export function WheelWrapperStyle({ children }) {
  return <div className="relative px-24">{children}</div>
}

export function CaptionStyle({ children }) {
  return <h4 className="absolute top-14 left-0 right-0 text-center">{children}</h4>
}