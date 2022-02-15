import React from "react";
import { CellStyle } from "../styles/InnerStyles";
import { getCellValue } from "../services/stats.services";

function StatsRow({ playerId, index, layoutArray, players, stats }) {
  return layoutArray.map((col) => 
    <CellStyle key={playerId+'_'+(col.label || '_none')} {...col}>
      { getCellValue(col, index, players[playerId], stats[playerId]) }
    </CellStyle>
  );
}

export default StatsRow;