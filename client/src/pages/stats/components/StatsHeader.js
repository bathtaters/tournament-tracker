import React from "react";
import { HeaderStyle } from "../styles/InnerStyles";

// Memoized Header
const StatsHeader = React.memo(function StatsHeader({ layoutArray }) {
  return layoutArray.map((col) => <HeaderStyle label={col.label} key={col.label || '_none'} />);
});

export default StatsHeader;