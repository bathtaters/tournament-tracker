import React, { useMemo } from "react";

import EventStats from "./EventStats";
import SettingsIcon from "./subcomponents/SettingsIcon";
import { EditEventButton } from "../styles/ButtonStyles"; 
import { ContainerStyle, HeaderStyle, ValueStyle, DetailStyle } from "../styles/DashboardStyles";


function EventDashboard({ data, openStats }) {
  const headerValue = data.status === 2 ? 'Round ' + data.roundactive :
    data.status === 1 ? 'Unstarted' : data.status === 3 ? 'Finished' : 'Event'
  
  const headerDetail = useMemo(() =>
    data ? `${data.playerspermatch}-Player, ${data.roundcount} Rounds, Best of ${(data.wincount ?? 0) * 2 - 1}` : '',
    [data?.playerspermatch, data?.roundcount, data?.wincount]
  )

  return (
    <ContainerStyle>
      <HeaderStyle>
        <EditEventButton onClick={openStats} />
        
        <ValueStyle>{headerValue}</ValueStyle>

        { data.playerspermatch && data.wincount && (<DetailStyle>{headerDetail}</DetailStyle>) }
      </HeaderStyle>

      { data.players && data.players.length ? <EventStats event={data} /> : null }
    </ContainerStyle>
  );
}

export default EventDashboard;