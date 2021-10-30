import React, { Fragment, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import dragHandle, { preventDef } from '../../controllers/dragAndDrop';
import { formatMatchTitle, formatRecord } from '../../assets/strings';

import Modal from "./Modal";
import Report from "./Report";
import Counter from "./Counter";

// Highlight on drag class style
const highlightCss = ['border-double','border-max','bg-opacity-50'];

function Match({ data, setData, swapPlayers, players, isEditing }) {
  const reportModal = useRef(null);

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
  
  return pug`
    .m-1.border.dim-border.rounded-md.h-32.flex.flex-col.justify-evenly.relative
      .text-center
        each playerId, index in Object.keys(data.players)
          Fragment(key=playerId+".n")
            if index
              .inline-block.font-thin.text-sm.dim-color.p-2.align-middle.pointer-events-none vs.

            .inline-block.border.border-dotted.rounded-2xl.dimmer-border.border-opacity-0.p-2.mx-1.mb-1.max-bgd.bg-opacity-0(
              className=(isEditing ? "border-opacity-100 hover:bg-opacity-50" : "")
              draggable=isEditing
              onDragStart=dragHandle.start({ id: data.id, playerId })
              onDragEnter=dragHandle.enter(highlightCss)
              onDragOver=preventDef
              onDragLeave=dragHandle.leave(highlightCss)
              onDrop=dragHandle.drop({ id: data.id, playerId }, swapPlayers, highlightCss)
            )
              h4.mb-0.pb-0.block.text-xl
                if isEditing
                  span.link-color.font-light.pointer-events-none= players[playerId].name

                else
                  Link.font-light(to="/profile/"+playerId)= players[playerId].name

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
            onClick=(()=>reportModal.current.open())
          )
      
        if isEditing
          .text-red-500.absolute.bottom-0.right-1.text-xs.font-thin.cursor-pointer(
            className="hover:neg-color"
            onClick=clearReport
          ) ∅
      
    Modal(ref=reportModal, startLocked=true)
      Report(
        title=formatMatchTitle(data.players, players)
        match=data
        players=players
        hideModal=(()=>reportModal.current.close(true))
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
