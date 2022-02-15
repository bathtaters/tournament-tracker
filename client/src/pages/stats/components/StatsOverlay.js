import React from "react";
import { OverlayRowStyle } from "../styles/InnerStyles";

function StatsOverlay({ players, clickHandler, className = '' }) {
  return players.map((pid) => 
    <OverlayRowStyle
      key={pid+'__L'}
      className={className}
      onClick={clickHandler(pid)}
      to={'/profile/'+pid}
    />
  );
}

export default StatsOverlay;