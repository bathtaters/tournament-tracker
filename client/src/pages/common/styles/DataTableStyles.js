import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { layoutTemplate } from "../services/dataTable.services"

const gridBase = "grid grid-flow-row gap-y-1 py-2"

export const headerBase = "text-center"

export function WrapperStyle({ children }) {
  return <div className="relative overflow-auto min-w-max">{children}</div>
}


export function GridStyle({ colLayout, className = '', children }) {
  const gridTemplateColumns = useMemo(() => layoutTemplate(colLayout), [])
  return (
    <div className={gridBase + " gap-x-2 px-4 items-center " + className} style={{ gridTemplateColumns }}>
      {children}
    </div>
  )
}

export function OverlayStyle({ className = '', hdrClass, children }) {
  return (
    <div className={gridBase + " grid-cols-1 absolute top-0 left-0 right-0 bottom-0 z-0 " + className}>
      <HeaderStyle label=" " className={hdrClass} />
      {children}
    </div>
  )
}

export function OverlayRowStyle({ to, onClick, onHover, className = '' }) {
  if (!to) return (
    <div
      onClick={onClick} onMouseEnter={onHover}
      className={`w-full h-full px-2 bg-opacity-0 base-bgd-inv ${className} hover:bg-opacity-25`}
    >{" "}</div>
  )
  return (
    <Link
      to={to} onClick={onClick} onMouseEnter={onHover}
      className={`w-full h-full px-2 bg-opacity-0 base-bgd-inv ${className} hover:bg-opacity-25`}
    >{" "}</Link>
  )
}

export function HeaderStyle({ label, span = 1, className = '' }) {
  return <h4 className={`${className} col-span-${span}`}>{label}</h4>
}

export function CellStyle({ cellStyle, span = 1, baseClass = '', className = '', children }) {
  const {size,color,weight,align} = { size: 'sm', color: 'base', weight: 'thin', align: 'center', ...cellStyle }
  return (
    <div className={`${baseClass} text-${size} font-${weight} text-${align} ${color}-color ${className} col-span-${span}`}>
      {children}
    </div>
  )
}

export function MissingStyle({ colCount = 1, children }) {
  return <div className={`italic dim-color text-center font-thin col-span-${colCount}`}>{children}</div>
}