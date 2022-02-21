import React from "react";
import { Link } from "react-router-dom";

import { CellStyle } from "../styles/CellStyle";
import { getCellData } from "../services/playerEvent.services";

function EventCell({ row, data, prefetch }) {
  // Hidden
  if (row.hideBelow && row.hideBelow > data.status) return <CellStyle span={row.span} />;
  
  const { value, className, linkTo, onHover } = getCellData(row, data, prefetch);
  
  // Non-Link
  if (!row.link) return <CellStyle span={row.span} className={className}>{value}</CellStyle>;

  // Link
  return (
    <CellStyle span={row.span}>
      <Link to={linkTo} className={className} onMouseEnter={onHover}>
        {value}
      </Link>
    </CellStyle>
  );
}

export default EventCell;