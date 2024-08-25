import React from "react";
import PropTypes from 'prop-types';

import DataTable from "../common/DataTable";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import statsLayout from "./stats.layout";
import { getPlayerList } from "./services/stats.services";
import { useStatsQuery, usePlayerQuery, useSettingsQuery } from "../common/common.fetch";
import { apiPollMs } from "../../assets/config";

function Stats({ eventid, onPlayerClick, className = 'table-zebra', highlightClass = '', hideTeams, hideStats, showCredits }) {
  // Global state
  const { data: stats, isLoading, error } = useStatsQuery(eventid, { skip: hideStats, pollingInterval: apiPollMs })
  const { data: players, isLoading: playLoad, error: playErr } = usePlayerQuery(undefined, { pollingInterval: apiPollMs })
  const { data: settings, isLoading: sLoad, error: sErr } = useSettingsQuery()
  
  const playerList = getPlayerList(stats?.ranking, players, !eventid, hideTeams)
  const enableCredits = sLoad || sErr ? showCredits : showCredits && settings.showcredits

  // Loading/Error catcher
  if (isLoading || playLoad || sLoad || error || playErr || sErr) return (
    <DataTable colLayout={statsLayout(true, enableCredits)} className={className}>
      <Loading loading={isLoading || playLoad || sLoad} error={error || playErr || sErr} />
    </DataTable>
  )
  
  // Render
  return (
    <div className="w-full overflow-auto">
      <DataTable
        colLayout={statsLayout(hideStats, enableCredits)}
        rowIds={playerList}
        extra={{ stats, players }}
        rowLink="profile/"
        rowClass={highlightClass}
        className={className}
        hdrClass="text-center mb-2"
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