import React from "react";
import { HeaderStyle, CellStyle, headerBase } from "../styles/DataTableStyles";
import { useLinkId } from "../services/idUrl.services";
import { getCellValue, cellKey } from "../services/dataTable.services";

export const HeaderRow = React.memo(function HeaderRow({
  colLayout,
  className,
}) {
  return (
    <thead>
      <tr>
        {colLayout.map(({ label, span, hdrClass }) => (
          <HeaderStyle
            label={label}
            span={span}
            className={`${className || ""} ${hdrClass ?? headerBase}`}
            key={label || "_none"}
          />
        ))}
      </tr>
    </thead>
  );
});

export function TableRow({
  id,
  index,
  colLayout,
  extra,
  className,
  cellClass,
  rowLink,
  onClick,
  onHover,
}) {
  const linkUrl = useLinkId(rowLink != null && id, rowLink);
  return (
    <tr
      className={`${className || "hover:bg-base-200"} ${linkUrl ? "cursor-pointer" : ""}`}
      onMouseEnter={onHover}
    >
      {colLayout.map((col) => {
        const colClass =
          typeof col.className === "function"
            ? col.className(id, extra)
            : col.className;

        return (
          <CellStyle
            key={cellKey(id, col.label)}
            baseClass={cellClass}
            to={linkUrl}
            onClick={onClick}
            {...col}
            className={colClass}
          >
            {getCellValue(col, id, index, extra)}
          </CellStyle>
        );
      })}
    </tr>
  );
}
