import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import Stats from "./Stats";
import { formatRecord } from '../../assets/strings';

function DraftStats({ title, ranking, players }) {
  const [statsOpen, setStatsOpen] = useState(false);
  return pug`
    .m-4
      h3.font-light.text-center Standings

      a.italic.text-xs.text-center.font-thin.block.mb-2(onClick=(()=>setStatsOpen(true))) View Stats

      .grid.grid-flow-row.grid-cols-5.gap-x-2.gap-y-1.items-center.dim-color
        each pid, idx in ranking
          Fragment(key=pid)
            span.font-light.text-right= (idx + 1)+'.'

            Link.col-span-2.text-lg.font-normal.text-left(to="/profile/"+pid)= players[pid].name

            span.col-span-2.font-light.text-xs.align-middle= formatRecord(players[pid].record,0)
      
    if statsOpen
      .fixed.top-0.left-0.w-screen.h-screen.z-40.base-bgd.bg-opacity-50.flex.justify-center.items-center.p-8(onClick=(()=>setStatsOpen(false)))
        .alt-bgd.shadow-lg.rounded-lg.relative.p-8.overflow-auto.max-h-full
          input.absolute.top-0.right-0(type="button" value="X" onClick=(()=>setStatsOpen(false)))

          h3.font-light.bright-color.text-center.mb-4= title+' Stats'
          
          Stats(ranking=ranking players=players)
  `;
}

DraftStats.propTypes = {
  title: PropTypes.string.isRequired,
  ranking: PropTypes.arrayOf(PropTypes.string),
  players: PropTypes.object,
};

export default DraftStats;