import React from "react";
import PropTypes from 'prop-types';

import DataTable from "../common/DataTable";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import statsLayout from "./stats.layout";
import { getPlayerList } from "./services/stats.services";
import { useStatsQuery, usePlayerQuery } from "../common/common.fetch";

function Stats({ eventid, onPlayerClick, className = '', highlightClass = '', hideTeams }) {
  // Global state
  const { data: stats, isLoading, error } = useStatsQuery(eventid)
  const { data: players, isLoading: playLoad, error: playErr } = usePlayerQuery()
  const playerList = getPlayerList(stats?.ranking, players, !eventid, hideTeams)

  // Loading/Error catcher
  if (isLoading || playLoad || error || playErr) return (
    <DataTable colLayout={statsLayout} className={className}>
      <Loading loading={isLoading || playLoad} error={error || playErr} />
    </DataTable>
  )
  
  // Render
  return (
    <div>
      <DataTable
        colLayout={statsLayout}
        rowIds={playerList}
        extra={{ stats, players }}
        rowLink="profile/"
        rowClass={highlightClass}
        className={className}
        hdrClass="text-center max-color mb-2"
        onRowClick={onPlayerClick}
      >
        No players exist
      </DataTable>

      <RawData className="text-sm" data={stats} />
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