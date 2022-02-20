import React from "react";
import { Link } from "react-router-dom";

import { CellStyle } from "../styles/CellStyle";

// Each Cell
function EventCell({ row, data, prefetch }) {
  // Hidden
  if (row.hideBelow && row.hideBelow > data.status) return <CellStyle span={row.span} />;
  
  const value = row.value(data);
  const className = row.class ? row.class(data) : '';
  
  // Not Link
  if (!row.link) return <CellStyle span={row.span} className={className}>{value}</CellStyle>;

  // Is Link
  return (
    <CellStyle span={row.span}>
      <Link to={row.link(data)} className={className} onMouseEnter={()=>prefetch(data.id)}>
        {value}
      </Link>
    </CellStyle>
  );
}

export default EventCell;