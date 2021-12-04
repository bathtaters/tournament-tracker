import React, { useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import Modal from "./Modal";
import Stats from "./Stats";

import { useGetPlayerQuery } from "../../models/dbApi";

import { formatRecord } from '../../assets/strings';

function DraftStats({ title, ranking, active }) {
  const modal = useRef(null);
  const { data: players, isLoading, error } = useGetPlayerQuery();
  
  return pug`
    .m-4
      h3.font-light.text-center Standings

      if !isLoading && !error
        .italic.text-xs.text-center.font-thin.block.mb-2(
          className=(ranking.length ? "link" : "cursor-not-allowed")
          onClick=(()=>modal.current.open())
        ) View Stats

        .grid.grid-flow-row.grid-cols-5.gap-x-2.gap-y-1.items-center.dim-color
          each pid, idx in ranking
            Fragment(key=pid)
              span.font-light.text-right= (active.includes(pid) ? idx + 1 : 'D')+'.'

              if players[pid]
                Link.col-span-2.text-lg.font-normal.text-left(to="/profile/"+pid)= players[pid].name
                span.col-span-2.text-xs.font-light.align-middle= formatRecord(players[pid].record,0)
              
              else
                span.col-span-4.text-md.font-thin.align-middle.text-center.dim-color.italic – Missing –
                // span.col-span-2.text-xs.font-light.align-middle
        
      else
        .italic.text-xs.text-center.font-thin.block.mb-2= error ? JSON.stringify(error) : 'Loading...'
      
    Modal(ref=modal)
      h3.font-light.max-color.text-center.mb-4= title+' Stats'
      
      Stats(ranking=ranking players=players)
  `;
}

DraftStats.propTypes = {
  title: PropTypes.string.isRequired,
  ranking: PropTypes.arrayOf(PropTypes.string),
  active: PropTypes.arrayOf(PropTypes.string),
};

export default DraftStats;