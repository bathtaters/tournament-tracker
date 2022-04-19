import React from "react"

export const tableHdrStyle = "text-left text-xl"

export function WrapperStyle({ title, children }) {
  return (
    <div className="my-8">
      <h3 className="mb-2 font-thin">{title}</h3>
      {children}
    </div>
  )
}