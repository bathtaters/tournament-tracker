import React, { Fragment, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import { orderPlayers } from '../../controllers/draftHelpers';
import { formatQueryError, statsHeader } from '../../assets/strings';

import { usePlayerQuery } from "../../models/playerApi";


function Stats({ onPlayerClick, className, highlightClass }) {
  // Global state
  const { data: players, isLoading, error } = usePlayerQuery();
  const ranking = useCallback(() => orderPlayers(players), [players]); // is this right way to memoize?

  // Pass clicks to onPlayerClick
  const clickHandler = pid => event => {
    if (typeof onPlayerClick === 'function') onPlayerClick(pid, event, players[pid]);
  };

  return pug`
    .relative
      .grid.grid-flow-row.grid-cols-stats.gap-x-2.gap-y-1.items-center.px-4.py-2(className=className)
        each hdr,idx in statsHeader
          span.font-normal.mb-2.text-center(
            className = (hdr === "Name" ? "col-span-2 " : "text-center ") +
            (hdr.length === 3 ? "text-xs sm:text-xl" : "text-xl"),
            key="H"+idx
          )= hdr
        
        if isLoading
          .col-span-8.text-center.font-light.dim-color Loading...
        
        else if error
          .col-span-8.text-center.font-thin.italic.dim-color= formatQueryError(error)

        else
          each pid, idx in ranking()
            Fragment(key=pid+"S")
              span.font-light.text-right= idx + 1

              Link.text-lg.font-normal.text-left(to="/profile/"+pid onClick=clickHandler(pid))= players[pid].name

              each _, i in statsHeader.slice(1)
                span.text-sm.font-thin.text-center(key=pid+"C"+i)= !players[pid].record || players[pid].record[i] == null ? '-' : players[pid].record[i]
      
      if !isLoading && !error
        .grid.grid-flow-row.grid-cols-1.gap-x-2.gap-y-1.py-2.items-center.absolute.top-0.left-0.right-0.bottom-0.z-0
          .w-full.h-full.opacity-75.mb-2.bg-none
          
          each pid, idx in ranking()
            Link.w-full.h-full.px-2.opacity-0.base-bgd-inv(to="/profile/"+pid onClick=clickHandler(pid) className=highlightClass+" hover:opacity-25" key=pid+"L")
  `;
}

Stats.propTypes = {
  onPlayerClick: PropTypes.func,
  className: PropTypes.string,
  highlightClass: PropTypes.string,
};

export default Stats;