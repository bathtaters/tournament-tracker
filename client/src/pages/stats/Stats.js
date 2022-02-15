import React from "react";
import PropTypes from 'prop-types';

import StatsHeader from "./components/StatsHeader";
import StatsRow from "./components/StatsRow";
import StatsOverlay from "./components/StatsOverlay";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { StatsStyle, GridStyle, OverlayStyle } from "./styles/StatsStyles";
import statsLayout from "./stats.layout";

import { useStatsQuery, usePlayerQuery } from "../common/common.fetch";
import { getPlayerList, colCount } from "./services/stats.services";


function Stats({ eventid, onPlayerClick, className = '', highlightClass = '', hideTeams }) {
  // Global state
  const { data, isLoading, error } = useStatsQuery(eventid);
  const { data: players, isLoading: playLoad, error: playErr } = usePlayerQuery();
  const playerList = getPlayerList(data && data.ranking, players, !eventid, hideTeams);

  // Pass clicks to onPlayerClick
  const clickHandler = pid => event => {
    if (typeof onPlayerClick === 'function')
      onPlayerClick(pid, event, {...players[pid], ...data[pid]});
  };

  // Loading/Error catcher
  if (isLoading || playLoad || error || playErr) return (
    <StatsStyle><GridStyle className={className} layoutArray={statsLayout}>
      <StatsHeader layoutArray={statsLayout} />
      <Loading loading={isLoading || playLoad} error={error || playErr} className={'col-span-'+colCount(statsLayout)} />
    </GridStyle></StatsStyle>
  );
  
  // Render
  return (
    <div>
      <StatsStyle>
        <GridStyle className={className} layoutArray={statsLayout}>
          <StatsHeader layoutArray={statsLayout} />

          { playerList.map((id, idx) => 
            <StatsRow key={id+'__S'} playerId={id} index={idx} layoutArray={statsLayout} players={players} stats={data} />
          ) }
        </GridStyle>

        <OverlayStyle>
          <StatsOverlay players={playerList} className={highlightClass} clickHandler={clickHandler} />
        </OverlayStyle>

      </StatsStyle>

      <RawData className="text-sm" data={data} />
    </div>
  );
}

Stats.propTypes = {
  eventid: PropTypes.string,
  onPlayerClick: PropTypes.func,
  className: PropTypes.string,
  highlightClass: PropTypes.string,
};

export default Stats;