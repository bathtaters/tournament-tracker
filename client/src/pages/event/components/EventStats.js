import React, { useRef } from "react";
import PropTypes from 'prop-types';

import Stats from "../../stats/Stats";
import StatsRow from "./subcomponents/StatsRow";
import { EventStatsStyle, ViewStatsStyle, StatsRowStyle, ModalTitleStyle } from "../styles/StatsStyles";

import Modal from "../../common/Modal";
import Loading from "../../common/Loading";

import { useStatsQuery, usePlayerQuery } from "../event.fetch";

function EventStats({ event }) {
  // Global
  const modal = useRef(null);
  const { data,          isLoading,                 error              } = useStatsQuery(event.id);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();

  // Loading/Error catcher
  if (isLoading || loadingPlayers || error || playerError)
    return <Loading loading={isLoading || loadingPlayers} error={error || playerError} className="text-xs mb-2" />;

  const isRanked = data?.ranking?.length;
  
  return (
    <EventStatsStyle title={isRanked ? 'Standings' : 'Players'}>

      <ViewStatsStyle onClick={isRanked ? ()=>modal.current.open() : null}>View Stats</ViewStatsStyle>

      <StatsRowStyle>
        { (isRanked ? data.ranking : event.players).map((pid,idx) => 
          <StatsRow
            rowNum={isRanked && idx + 1}
            id={pid}
            name={players[pid]?.name}
            isDrop={event.drops?.includes(pid)}
            record={data[pid]?.matchRecord}
            key={pid}
          />
        ) }
      </StatsRowStyle>

      <Modal ref={modal}>
        <ModalTitleStyle>{event.title+' Stats'}</ModalTitleStyle>
        <Stats eventid={event.id} playerList={data?.ranking} players={players} />
      </Modal>

    </EventStatsStyle>
  );
}

EventStats.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventStats;