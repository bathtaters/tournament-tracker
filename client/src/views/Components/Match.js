import React, { Fragment, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import { formatMatchTitle, formatRecord } from '../../assets/strings';

import Modal from "./Modal";
import DragBlock from "./DragBlock";
import Report from "./Report";
import Counter from "./Counter";

import {
  useGetPlayerQuery,
  useDropPlayerMutation, useSwapPlayersMutation,
  useReportMutation, useUpdateMatchMutation,
} from "../../models/dbApi";

const getMatchDrops = (matchData, remainingPlayers) =>
  Object.keys(matchData.players).filter(p => !remainingPlayers.includes(p));

function Match({ data, draftId, activePlayers, isEditing }) {
  // Init
  const reportModal = useRef(null);
  const canSwap = useCallback((types, a, b) => a !== b && types.includes("json/matchplayer"),[]);
  
  // Global State
  const { data: players, isLoading, error } = useGetPlayerQuery();
  const title = isLoading ? 'Loading' : data.players ? formatMatchTitle(data.players, players) : console.log(data) || JSON.stringify(data);

  // Actions
  const [ dropPlayer ] = useDropPlayerMutation();
  const changeActive = (playerIds, undrop = false) => playerIds.forEach(player =>
    dropPlayer({ draft: draftId, player, undrop })
  );

  const [ update ] = useUpdateMatchMutation();
  const setVal = (baseKey, innerKey=null) => val =>
    update({ id: data.id, [baseKey]: innerKey ? {[innerKey]: val} : val });
  
  const [ report, { isLoading: isReporting } ] = useReportMutation();
  const clearReport = () => {
    if (window.confirm(`Are you sure you want to delete the records for ${title}?`)) {
      const drops = getMatchDrops(data, activePlayers);
      if (drops.length) changeActive(drops, true);
      report({ id: data.id, clear: true });
    }
  };

  const [ swapPlayers ] = useSwapPlayersMutation();
  const handleSwap = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    swapPlayers({playerA, playerB});
  };
  
  // Render
  return pug`
    .m-1.border.dim-border.rounded-md.h-32.flex.flex-col.justify-evenly.relative
      if isLoading
        .m-auto ...
      
      else if error
        .m-auto= 'Error: '+JSON.stringify(error)
      
      else
        .flex.justify-evenly.items-center.text-center
          each playerId, index in Object.keys(data.players)
            Fragment(key=playerId+".n")
              if index
                .inline-block.flex-shrink.font-thin.text-sm.dim-color.p-2.align-middle.pointer-events-none vs.
              
              DragBlock.inline-block.flex-grow.rounded-2xl.p-2.mx-1.mb-1(
                storeData=({ id: data.id, playerId })
                storeTestData=data.id
                onDrop=handleSwap
                canDrop=canSwap
                isAvailable=isEditing
                dataType="json/matchplayer"
              )
                h4.mb-0.pb-0.block.text-xl(className=(isEditing ? "pointer-events-none" : ""))
                  if isEditing
                    span.link-color.font-light= players[playerId] && players[playerId].name || '?'

                  else if players[playerId]
                    Link.font-light(to="/profile/"+playerId)= players[playerId].name || '?'
                  
                  else
                    .font-light.link-color(playerid=playerId) ?

                .text-xs.font-thin.mt-0.pt-0.pointer-events-none.mb-1
                  if data.drops && data.drops.includes(playerId)
                    .neg-color Dropped
                  
                  else if Object.keys(data.players).length === 1
                    .dim-color.italic Bye

                  else
                    .dim-color= formatRecord(players[playerId] && players[playerId].record)
        
        if data.reported && !isReporting
          .text-center.w-full.font-light.text-xs.pos-color.-mt-1(
            className=(isEditing || data.draws ? "" : "invisible")
          )
            Counter(
              val=isNaN(data.draws) ? data.draws : +data.draws,
              setVal=setVal('draws'),
              suff=(d=>" draw"+(d===1?"":"s")),
              maxVal=3, isEditing=isEditing
            )

        .flex.justify-evenly.text-center.pos-color.mb-2
          if data.reported
            each playerId, index in Object.keys(data.players)
              Fragment(key=playerId+".w")
                if index
                  span.inline-block= ' – '
                
                if isReporting
                  span .

                else
                  Counter.text-base(
                    val=isNaN(data.players[playerId]) ? data.players[playerId] : +data.players[playerId],
                    setVal=setVal('players', playerId),
                    maxVal=2, isEditing=isEditing
                  )

            if isEditing
              .text-red-500.absolute.bottom-0.right-1.text-xs.font-thin.cursor-pointer(
                className="hover:neg-color"
                onClick=clearReport
              ) ∅
              
          else
            input.block.text-xs.font-light.neg-color.mt-1(
              type="button"
              value="Report"
              onClick=(()=>reportModal.current.open())
              disabled=(isEditing || isReporting)
            )
        
        Modal(ref=reportModal, startLocked=true)
          Report(
            title=title
            match=data
            hideModal=(()=>reportModal.current.close(true))
            setData=null
            draftId=draftId
          )
  `;
}

Match.propTypes = {
  data: PropTypes.object,
  draftId: PropTypes.string.isRequired,
  activePlayers: PropTypes.arrayOf(PropTypes.string),
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
