import React from "react"
import { HeaderStyle, CellStyle, OverlayRowStyle, headerBase } from "../styles/DataTableStyles"
import { useLinkId } from "../services/idUrl.services"
import { getCellValue } from "../services/dataTable.services"


export const HeaderRow = React.memo(function HeaderRow({ colLayout, className }) {
  return colLayout.map(({ label, span, hdrClass }) =>
    <HeaderStyle label={label} span={span} className={`${className || ''} ${hdrClass ?? headerBase}`} key={label || '_none'} />
  )
})


export function BaseRow({ id, extra, index, colLayout, className }) {
  return colLayout.map((col) => {
    const cellClass = typeof col.className === 'function' ? col.className(id, extra) : col.className
    return (
      <CellStyle key={id+'_'+(col.label || '_none')} baseClass={className} {...col} className={cellClass}>
        { getCellValue(col, id, index, extra) }
      </CellStyle>
    )
  })
}


export function OverlayRow({ id, rowLink, onClick, onHover, className }) {
  const linkUrl = useLinkId(rowLink != null && id, rowLink)
  return <OverlayRowStyle to={linkUrl} className={className} onClick={onClick} onHover={onHover} />
}