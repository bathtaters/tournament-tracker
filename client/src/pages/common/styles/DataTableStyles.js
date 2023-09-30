import React from "react";
import { Link } from "react-router-dom";

export const headerBase = "text-center"

export function TableStyle({ className = '', children }) {
  return <table className={`table ${className}`}>{children}</table>
}

export function HeaderStyle({ label, span = 1, className = '' }) {
  return <th className={className} colSpan={span}>{label}</th>
}

export function CellStyle({ to, onClick, cellStyle, span = 1, baseClass = '', className = '', children }) {
  const {size,color,weight,align} = { size: 'sm', color: 'base-content', weight: 'thin', align: 'center', ...cellStyle }
  return (
    <td className={`relative ${baseClass} text-${size} font-${weight} text-${align} text-${color} ${className}`} colSpan={span}>
      { to && <Link to={to} className="absolute block top-0 bottom-0 left-0 right-0" onClick={onClick} /> }
      {children}
    </td>
  )
}

export function MissingStyle({ colCount = 1, children }) {
  return <tr><td className="italic opacity-90 text-center font-thin" colSpan={colCount}>{children}</td></tr>
}