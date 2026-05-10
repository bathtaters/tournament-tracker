import type { MouseEvent, ReactNode } from "react";
import type { Column, RowActionHandler } from "./DataTable.d";
import { HeaderRow, TableRow } from "./DataTableRows";
import { MissingStyle, TableStyle } from "./DataTableStyles";

/**
 * DataTable component props
 *
 * @param colLayout - Array of column definitions
 * @param rowIds - Array of row identifiers used in get() function
 * @param extra - Additional data passed to column get() functions
 * @param rowLink - Prefix for row links (Link.to = rowLink + rowId)
 * @param onRowClick - Event handler when row is clicked (args: rowId, event, { data[row], extra, idx })
 * @param onRowHover - Event handler when row is hovered
 * @param className - Grid wrapper styling
 * @param hdrClass - Styling applied to all header cells
 * @param rowClass - Row styling (intended for hover effects)
 * @param cellClass - Cell styling (excludes header cells)
 * @param children - Content displayed when no rows are present
 */
export type DataTableProps<T> = {
  colLayout: Column<T>[];
  rowIds?: string[];
  extra?: T;
  rowLink?: string;
  onRowClick?: RowActionHandler<T, MouseEvent<HTMLAnchorElement>>;
  onRowHover?: RowActionHandler<T, MouseEvent<HTMLAnchorElement>>;
  className?: string;
  hdrClass?: string;
  rowClass?: string;
  cellClass?: string;
  children?: ReactNode;
};

/**
 * DataTable: Generic Table w/ clickable rows
 *
 * NOTE: ColLayout should be STATIC!!!! (Otherwise change 'useMemo' function below & in Styles.GridStyle)
 */
export default function DataTable<ExtraType>({
  colLayout,
  rowIds,
  extra,
  rowLink,
  onRowClick,
  onRowHover,
  className = "",
  hdrClass = "",
  rowClass = "",
  cellClass = "",
  children,
}: DataTableProps<ExtraType>) {
  const colCount = colLayout.reduce((sum, col) => sum + (col.span ?? 1), 0);

  // Render
  return (
    <TableStyle className={className}>
      <HeaderRow className={hdrClass} colLayout={colLayout} />
      <tbody>
        {!rowIds?.length ? (
          <MissingStyle colCount={colCount}>{children}</MissingStyle>
        ) : (
          rowIds.map((id, idx) => (
            <TableRow
              key={id}
              id={id}
              index={idx}
              colLayout={colLayout}
              extra={extra}
              className={rowClass}
              cellClass={cellClass}
              rowLink={rowLink}
              onClick={onRowClick && ((ev) => onRowClick(id, ev, extra, idx))}
              onHover={onRowHover && ((ev) => onRowHover(id, ev, extra, idx))}
            />
          ))
        )}
      </tbody>
    </TableStyle>
  );
}
