import React, { useMemo } from "react";

import { HeaderRow, BaseRow, OverlayRow } from "./components/DataTableRows";
import { WrapperStyle, GridStyle, OverlayStyle, MissingStyle } from "./styles/DataTableStyles";

import { colCount } from "./services/dataTable.services"

/* *** DataTable: Generic Table w/ clickable rows *** *\
  !!!! ColLayout should be STATIC !!!! (Otherwise change 'useMemo' function below & in Styles.GridStyle)
  ColLayout = [ { 
    id:         column ID,
    label:      header text,
    span:       columns to span (default: 1),
    hdrClass:   header cell class,
    className:  column cells class (not applied to header cell),
    default:    default value to use if get() returns undef/null
    get(rowId, extra, rowIndex): get value for specified row & this column,
    format(value): how to format a column value (default value excluded),
  }, ... ] 
  RowData   = [ { id: 'row ID', ...{data passed to col.get()} }, ... ]
  Extra     = passed to col.get()
  rowLink    (optional) = prefix for row link (Link.to = rowLink + rowData.id) (no value diables links)
  onRowClick (optional) = event to trigger when a row is clicked (func args: (rowId, event, { data[row], extra, idx }))
  className  (optional) = grid wrapper styling
  rowClass   (optional) = row styling (intended to use hover: to style mouseover)
  hdrClass   (optional) = styling to apply to all header cells
  cellClass  (optional) = cell styling (excludes header cells)
  children   (optional) = displayed when no rows are present
\* ***  ---  *** */

function DataTable({ colLayout, rowIds, extra, rowLink, onRowClick, hdrClass, className = '', rowClass = '', cellClass = '', children }) {
  // Pass clicks to onRowClick
  const clickHandler = (rowId, idx) => typeof onRowClick === 'function' ?
    (ev) => onRowClick(rowId, ev, extra, idx) : undefined
  
  const colCnt = useMemo(() => colCount(colLayout), [])
  
  // Render
  return (
      <WrapperStyle>
        <GridStyle className={className} colLayout={colLayout}>
          <HeaderRow colLayout={colLayout} className={hdrClass} />
          { !rowIds?.length ? <MissingStyle colCount={colCnt}>{children}</MissingStyle> :
            rowIds.map((id, idx) => 
              <BaseRow key={id+'__S'} id={id} index={idx} colLayout={colLayout} extra={extra} className={cellClass} />
            )
          }
        </GridStyle>

        <OverlayStyle className={className} hdrClass={hdrClass}>
          { rowIds?.map((id, idx) => 
            <OverlayRow key={id+'__L'} id={id} rowLink={rowLink} className={`${rowClass} ${cellClass}`} onClick={clickHandler(id, idx)} />
          )}
        </OverlayStyle>

      </WrapperStyle>
  )
}

export default DataTable