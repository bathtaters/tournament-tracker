import React from "react";

import EventStats from "./EventStats";
import { 
  DashContainerStyle, DashStatusStyle,
  DashDetailStyle, DashButtonStyle, 
  dashText, 
} from "../styles/EventStyles";


function EventDashboard({ data, openStats }) {
  return (
    <DashContainerStyle>
      <DashStatusStyle>{
        data.status === 2 ? (<>
          <span className={dashText.base}>Round</span>
          <span className={dashText.both()}>{data.roundactive}</span>
          <span className={dashText.base}>of</span>
          <span className={dashText.dynamic}>{data.roundcount}</span>
        </>) :

        data.status && (
          <span>{data.status === 1 ? 'Not started' : 'Complete'}</span>
        ) 
      }</DashStatusStyle>

      {data.playerspermatch && data.wincount && (
        <DashDetailStyle>{data.playerspermatch}-player, first to {data.wincount}</DashDetailStyle>
      )}

      <DashButtonStyle>
        <input
          className="dim-color font-light"
          onClick={openStats}
          type="button"
          value="Edit Settings"
        />
      </DashButtonStyle>

      { data.players && data.players.length ? <EventStats event={data} /> : null }
    </DashContainerStyle>
  );
}

export default EventDashboard;