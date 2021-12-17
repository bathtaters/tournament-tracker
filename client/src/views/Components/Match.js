import React, { Fragment, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import {
  formatQueryError, formatMatchTitle, formatRecord,
  swapPlayerMsg, showRawJson
} from '../../assets/strings';
import { getWinsMax } from "../../controllers/draftHelpers";

import Modal from "./Modal";
import DragBlock from "./DragBlock";
import Report from "./Report";
import Counter from "./Counter";

import { usePlayerQuery } from "../../models/playerApi";
import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
} from "../../models/matchApi";
import { useBreakersQuery } from "../../models/draftApi";



function Match({ draftId, matchId, bestOf, isEditing }) {
  // Init
  const reportModal = useRef(null);
  const canSwap = useCallback((types, a, b) => a !== b && types.includes("json/matchplayer"),[]);
  
  // Global State
  const { data, isLoading, error } = useMatchQuery(draftId);
  const { data: rankings, isLoading: loadingRank, error: rankError } = useBreakersQuery(draftId);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const matchData = data && data[matchId];
  const maxWins = getWinsMax(bestOf);
  const title = isLoading || loadingPlayers || !matchData || !players ? 'Loading' :
    matchData.players ? formatMatchTitle(matchData.players, players) :
    console.error('Title error:',matchData) || 'Untitled';
  
  // Change reported values
  const [ update ] = useUpdateMatchMutation();
  const setVal = (baseKey, innerKey=null) => val =>
    update({ id: matchData.id, draftId, [baseKey]: innerKey ? {[innerKey]: val} : val });
  
  // Report match
  const [ report, { isLoading: isReporting } ] = useReportMutation();
  const clearReport = () => {
    if (window.confirm(`Are you sure you want to delete the records for ${title}?`)) {
      report({ id: matchData.id, draftId, clear: true });
    }
  };

  // Swap players
  const [ swapPlayers ] = useSwapPlayersMutation();
  const handleSwap = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    if ((playerA.reported || playerB.reported) && !window.confirm(swapPlayerMsg())) return;
    swapPlayers({draftId, playerA, playerB});
  };
  
  // Render
  return pug`
    .m-1.border.dim-border.rounded-md.flex.flex-col.justify-evenly.relative(className=(showRawJson?"h-64":"h-32"))
      if isLoading || loadingRank || loadingPlayers || !matchData
        .m-auto ...
      
      else if error || rankError || playerError
        .m-auto= formatQueryError(error || rankError || playerError)

      else
        .flex.justify-evenly.items-center.text-center
          each playerId, index in Object.keys(matchData.players)
            Fragment(key=playerId+".n")
              if index
                .inline-block.flex-shrink.font-thin.text-sm.dim-color.p-2.align-middle.pointer-events-none vs.
              
              DragBlock.inline-block.flex-grow.rounded-2xl.p-2.mx-1.mb-1(
                storeData=({ id: matchData.id, playerId, reported: matchData.reported })
                storeTestData=matchData.id
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
                  if matchData.drops.includes(playerId)
                    .neg-color Dropped

                  else
                    .dim-color= formatRecord(rankings && rankings[playerId] && rankings[playerId].matches)
        
        if matchData.reported
          .text-center.w-full.font-light.text-xs.base-color.-mt-1(
            className=(isEditing || (matchData.draws && !matchData.isbye) ? "" : "invisible")
          )
            Counter(
              val=isNaN(matchData.draws) ? matchData.draws : +matchData.draws,
              setVal=setVal('draws'),
              suff=(d=>" draw"+(d===1?"":"s")),
              maxVal=bestOf, isEditing=isEditing
            )

        .flex.justify-evenly.text-center.base-color.mb-2 
          if matchData.reported
            each playerId, index in Object.keys(matchData.players)
              Fragment(key=playerId+".w")
                -var isWinner = matchData.winners && matchData.winners.includes(playerId)

                if index
                  span.inline-block= ' – '

                if matchData.isbye && !isEditing
                  .pos-color.italic.font-thin Bye

                else
                  Counter.text-base(
                    className=(isEditing || !matchData.isbye ? "" : "invisible ")+(isWinner ? "pos-color" : "")
                    val=isNaN(matchData.players[playerId]) ? matchData.players[playerId] : +matchData.players[playerId],
                    setVal=setVal('players', playerId),
                    maxVal=maxWins, isEditing=isEditing
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
          
        if showRawJson
          .text-center.font-thin.text-xs.w-80.m-auto= JSON.stringify(matchData)
        
        Modal(ref=reportModal, startLocked=true)
          Report(
            title=title
            match=matchData
            hideModal=(()=>reportModal.current.close(true))
            bestOf=bestOf
            maxWins=maxWins
            draftId=draftId
          )
  `;
}

Match.propTypes = {
  matchId: PropTypes.string,
  draftId: PropTypes.string,
  bestOf: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
