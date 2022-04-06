import React from "react";
import { OverlayRowStyle } from "../styles/InnerStyles";
import { useLinkId } from "../../common/services/idUrl.services";

function StatsOverlayRow({ id, onClick, className = '' }) {
  const playerUrl = useLinkId(id, 'profile/')
  return <OverlayRowStyle className={className} onClick={onClick} to={playerUrl} />
}

function StatsOverlay({ players, clickHandler, className = '' }) {
  return players.map((pid) => 
    <StatsOverlayRow key={pid+'__L'} id={pid} className={className} onClick={clickHandler(pid)} />
  )
}

export default StatsOverlay