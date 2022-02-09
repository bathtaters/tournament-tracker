import React, { useRef } from "react";
import PropTypes from 'prop-types';

import StatsRow from "./StatsRow";
import { EventStatsStyle, ViewStatsStyle, StatsRowStyle } from "../styles/StatsStyles";
import Modal from "../../common/Modal";
import Stats from "../../stats/Stats";

import { useStatsQuery, usePlayerQuery } from "../event.fetch";

import { formatQueryError } from '../../../assets/strings';


function EventStats({ event }) {
  const modal = useRef(null);

  // Global
  const { data,          isLoading,                 error              } = useStatsQuery(event.id);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();

  // Loading screen
  if (isLoading || loadingPlayers || error || playerError) return (
    <div className="italic text-xs text-center font-thin block mb-2">
      {isLoading || loadingPlayers ? 'Loading...' : formatQueryError(error || playerError)}
    </div>
  );

  const isRanked = data && data.ranking && data.ranking.length;
  
  return (
    <EventStatsStyle title={isRanked ? 'Standings' : 'Players'}>

      <ViewStatsStyle onClick={isRanked ? ()=>modal.current.open() : null}>View Stats</ViewStatsStyle>

      <StatsRowStyle>
        { (isRanked ? data.ranking : event.players).map((pid,idx) => 
          <StatsRow
            rowNum={isRanked && idx + 1}
            id={pid}
            name={players[pid].name}
            isDrop={event.drops && event.drops.includes(pid)}
            record={data[pid] && data[pid].matchRecord}
            key={pid}
          />
        ) }
      </StatsRowStyle>

      <Modal ref={modal}>
        <h3 className="font-light max-color text-center mb-4">{event.title+' Stats'}</h3>
        <Stats eventid={event.id} playerList={data && data.ranking} players={players} />
      </Modal>

    </EventStatsStyle>
  );
}

EventStats.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventStats;