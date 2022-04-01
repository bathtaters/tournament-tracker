import React from "react";
import { OverlayRowStyle } from "../styles/InnerStyles";
import { idToUrl } from "../../common/services/idUrl.services";

function StatsOverlay({ players, clickHandler, className = '' }) {
  return players.map((pid) => 
    <OverlayRowStyle
      key={pid+'__L'}
      className={className}
      onClick={clickHandler(pid)}
      to={'/profile/'+idToUrl(pid)}
    />
  );
}

export default StatsOverlay;