import React, { useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import Modal from "./Modal";
import Stats from "./Stats";

import { usePlayerQuery } from "../../models/playerApi";
import { useDraftQuery, useBreakersQuery } from "../../models/draftApi";

import { formatQueryError, formatRecord } from '../../assets/strings';


function DraftStats({ draftId }) {
  const modal = useRef(null);
  const { data,          isLoading,                 error              } = useBreakersQuery(draftId);
  const { data: draft,   isLoading: loadingDraft,   error: draftError  } = useDraftQuery(draftId);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  
  return pug`
    .m-4
      h3.font-light.text-center= data ? 'Standings' : 'Players'

      if isLoading || loadingDraft || loadingPlayers
        .italic.text-xs.text-center.font-thin.block.mb-2= isLoading ? 'Loading...' : 'N/A'

      else if error || draftError || playerError
        .italic.text-xs.text-center.font-thin.block.mb-2= formatQueryError(error || draftError || playerError)

      else
        .italic.text-xs.text-center.font-thin.block.mb-2(
          className=(data && data.ranking.length ? "link" : "cursor-not-allowed")
          onClick=(()=>modal.current.open())
        ) View Stats

        .grid.grid-flow-row.grid-cols-5.gap-x-2.gap-y-1.items-center.dim-color
          each pid, idx in (data ? data.ranking : draft.players)
            Fragment(key=pid)
              span.font-light.text-right(
                className=(draft.drops && draft.drops.includes(pid) ? 'neg-color' : '')
              )= (idx + 1)+')'

              if players[pid]
                Link.col-span-2.text-lg.font-normal.text-left(to="/profile/"+pid)= players[pid].name
                span.col-span-2.text-xs.font-light.align-middle= formatRecord(data && data[pid].matches,0)
              
              else
                span.col-span-4.text-md.font-thin.align-middle.text-center.dim-color.italic – Missing –
      
    Modal(ref=modal)
      h3.font-light.max-color.text-center.mb-4= draft.title+' Stats'
      
      Stats(draftId=draftId playerList=(data && data.ranking) players=players)
  `;
}

DraftStats.propTypes = {
  draftId: PropTypes.string.isRequired,
};

export default DraftStats;