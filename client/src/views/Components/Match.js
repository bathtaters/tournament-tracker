import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import dragHandle, { preventDef } from '../../controllers/dragAndDrop';
import { formatMatchTitle, formatRecord } from '../../assets/strings';

import Report from "./Report";
import Counter from "./Counter";

// Highlight on drag class style
const highlightCss = ['border-double','border-white','bg-opacity-50'];

function Match({ data, setData, swapPlayers, players, isEditing }) {

  const setVal = (baseKey, innerKey=null) => innerKey ? 
    (val) => {
      const newVal = { ...data };
      newVal[baseKey][innerKey] = val;
      setData(newVal);
    } :
    val => setData({...data, [baseKey]: val});

  const clearReport = ev => {
    if (window.confirm(`Are you sure you want to delete the records for ${formatMatchTitle(data.players, players)}?`))
      setVal('reported')(false);
  };

  const [isReporting, setReporting] = useState(false);
  
  return pug`
    .m-1.border.border-gray-600.rounded-md.h-32.flex.flex-col.justify-evenly.relative
      .text-center
        each playerId, index in Object.keys(data.players)
          Fragment(key=playerId+".n")
            if index
              .inline-block.font-thin.text-sm.dim-color.p-2.align-top vs.

            .inline-block.border.border-dotted.rounded-2xl.border-gray-500.border-opacity-0.p-2.mx-1.mb-1.slight-bgd.bg-opacity-0(
              className=(isEditing ? "border-opacity-100 hover:bg-opacity-50" : "")
              draggable=isEditing
              onDragStart=dragHandle.start({ matchId: data.id, id: playerId })
              onDragEnter=dragHandle.enter(highlightCss)
              onDragOver=preventDef
              onDragLeave=dragHandle.leave(highlightCss)
              onDrop=dragHandle.drop({ matchId: data.id, id: playerId }, swapPlayers, highlightCss)
            )
              h4.mb-0.pb-0.block.text-xl
                if isEditing
                  span.link-color.font-light.pointer-events-none(to="/profile/"+playerId)= players[playerId].name

                else
                  Link.font-light.link(to="/profile/"+playerId)= players[playerId].name

              .text-xs.font-thin.dim-color.mt-0.pt-0.pointer-events-none= formatRecord(players[playerId].record)
      
      if data.reported
        .text-center.w-full.font-light.text-xs.pos-color.-mt-1(
          className=(isEditing || data.draws ? "" : "invisible")
        )
          Counter(
            val=data.draws,
            setVal=setVal('draws'),
            suff=(d=>" draw"+(d===1?"":"s")),
            maxVal=3, isEditing=isEditing
          )

      .flex.justify-evenly.text-center.pos-color
        if data.reported
          each playerId, index in Object.keys(data.players)
            Fragment(key=playerId+".w")
              if index
                span.inline-block= ' – '
              
              Counter.text-base(
                val=data.players[playerId],
                setVal=setVal('players', playerId),
                maxVal=2, isEditing=isEditing
              )
            
        else
          input.block.text-xs.font-light.neg-color.mt-1(
            type="button"
            value="Report"
            onClick=(()=>setReporting(true))
          )
      
        if isEditing
          .text-red-500.absolute.bottom-0.right-1.text-xs.font-thin.cursor-pointer(
            className="hover:neg-color"
            onClick=clearReport
          ) ∅
      
    if isReporting
      Report(
        title=formatMatchTitle(data.players, players)
        match=data
        players=players
        hideModal=(()=>setReporting(false))
        setData=setData
      )
  `;
}

Match.propTypes = {
  data: PropTypes.object,
  players: PropTypes.object,
  setData: PropTypes.func,
  swapPlayers: PropTypes.func,
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
