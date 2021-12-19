import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import { 
  formatQueryError, formatNum, formatPercent
} from '../../assets/strings';
import { getPlayerList } from "../../controllers/misc";

import { useSettingsQuery } from "../../models/baseApi";
import { useBreakersQuery } from "../../models/draftApi";
import { usePlayerQuery } from "../../models/playerApi";


// Component Layout
const statsHeader = [
  { label: 'Name', get: 'playerName', },
  { label: 'W',   get: data => data.matches && data.matches[0], },
  { label: 'L',   get: data => data.matches && data.matches[1], },
  { label: 'D',   get: data => data.matches && data.matches[2], },
  { label: '%',   get: data => formatPercent(data.gameRate), },
  { label: 'OMW', get: data => formatPercent(data.oppMatch), },
  { label: 'OGW', get: data => formatPercent(data.oppGame), },
];


// Main Component
function Stats({ draftId, onPlayerClick, className, highlightClass }) {
  // Global state
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useBreakersQuery(draftId);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const playerList = getPlayerList(data && data.ranking, players, !draftId);

  // Pass clicks to onPlayerClick
  const clickHandler = pid => event => {
    if (typeof onPlayerClick === 'function')
      onPlayerClick(pid, event, {...players[pid], ...data[pid]});
  };
  
  return pug`
    div
      .relative
        .grid.grid-flow-row.grid-cols-stats.gap-x-2.gap-y-1.items-center.px-4.py-2(className=className)
          each col,idx in statsHeader
            span.font-normal.mb-2.text-center(
              className = (col.label === "Name" ? "col-span-2 " : "text-center ") +
              (col.label.length === 3 ? "text-xs sm:text-xl" : "text-xl"),
              key="H"+idx
            )= col.label
          
          if isLoading || loadingPlayers
            .col-span-8.text-center.font-light.dim-color Loading...
          
          else if error || playerError
            .col-span-8.text-center.font-thin.italic.dim-color= formatQueryError(error || playerError)

          else
            each pid, idx in playerList
              Fragment(key=pid+"S")
                span.font-light.text-right= idx + 1

                Link.text-lg.font-normal.text-left(to="/profile/"+pid onClick=clickHandler(pid))= (players[pid] && players[pid].name) || '-'

                each col, i in statsHeader.slice(1)
                  span.text-sm.font-thin.text-center(key=pid+"C"+i)= formatNum(data[pid] && col.get && col.get(data[pid]))

        if !isLoading && !loadingPlayers && !error && !playerError
          .grid.grid-flow-row.grid-cols-1.gap-x-2.gap-y-1.py-2.items-center.absolute.top-0.left-0.right-0.bottom-0.z-0
            .w-full.h-full.opacity-75.mb-2.bg-none
            
            each pid, idx in playerList
              Link.w-full.h-full.px-2.opacity-0.base-bgd-inv(to="/profile/"+pid onClick=clickHandler(pid) className=highlightClass+" hover:opacity-25" key=pid+"_L")
  
      if settings && settings.showrawjson
        .text-center.font-thin.m-2.text-sm= JSON.stringify(data)
  `;
}

Stats.propTypes = {
  draftId: PropTypes.string,
  onPlayerClick: PropTypes.func,
  className: PropTypes.string,
  highlightClass: PropTypes.string,
};

export default Stats;