import React from "react";

import EventStats from "./EventStats";
import { EditEventButton } from "../styles/ButtonStyles"; 
import { 
  ContainerStyle, StatusStyle,
  DetailStyle, textStyle, 
} from "../styles/DashboardStyles";


function EventDashboard({ data, openStats }) {
  return (
    <ContainerStyle>
      <StatusStyle>{
        data.status === 2 ? (<>
          <span className={textStyle.base}>Round</span>
          <span className={textStyle.both()}>{data.roundactive}</span>
          <span className={textStyle.base}>of</span>
          <span className={textStyle.dynamic}>{data.roundcount}</span>
        </>) :

        data.status && (
          <span>{data.status === 1 ? 'Not started' : 'Complete'}</span>
        ) 
      }</StatusStyle>

      {data.playerspermatch && data.wincount && (
        <DetailStyle>{data.playerspermatch}-player, first to {data.wincount}</DetailStyle>
      )}

      <EditEventButton onClick={openStats} />

      { data.players && data.players.length ? <EventStats event={data} /> : null }
    </ContainerStyle>
  );
}

export default EventDashboard;