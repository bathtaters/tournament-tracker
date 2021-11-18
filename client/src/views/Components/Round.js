import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import Match from './Match';
import { setRound, setMatch } from '../../models/drafts';

import { swapData, swapDrops } from '../../controllers/swapData';


function Round({ draftId, round, changeActive, deleteRound }) {
  // Global
  const dispatch = useDispatch();
  const matches = useSelector(state => (state.drafts[draftId].matches || [])[round]);

  // Local
  const [matchTemp, setMatchTemp] = useState(matches || []);
  const [isEditing, setEditing] = useState(false);
  
  // Local actions
  const toggleEditing = () => { if (!isEditing) setMatchTemp(matches || []); setEditing(!isEditing); };
  const handleRevert = () => { setMatchTemp(matches || []); toggleEditing(); }

  const updateMatchTemp = (id, idx, data) => {
    let newData = [...matchTemp];
    if (id !== newData[idx].id) idx = newData.findIndex(m => m.id === id);
    newData[idx] = data;
    setMatchTemp(newData);
  };

  const swapPlayers = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    const newData = swapData(matchTemp, 'players', 'id', playerA, playerB, 'playerId');
    swapDrops(newData,playerA,playerB);
    setMatchTemp(newData);
  };

  // Global actions
  const handleSave = () => { 
    dispatch(setRound({ draftId, round, data: matchTemp }));
    toggleEditing();
  }

  const updateMatch = (id, idx) => (data, isTemp = false) => {
    updateMatchTemp(id, idx, data);
    if (!isTemp) {
      dispatch(setMatch({ draftId, id, idx: [round,idx], data }));
      if (data.drops && data.drops.length) changeActive(data.drops, true);
    }
  }

  return pug`
    .m-4.relative(className=(isEditing ? "z-40" : ""))
      h3.font-light.text-center= 'Round '+(round+1)
      .flex.flex-col
        each match, idx in matchTemp
          Match(
            key=match.id
            data=match
            setData=updateMatch(match.id, idx)
            swapPlayers=swapPlayers
            changeActive=changeActive
            isEditing=isEditing
          )

        .font-thin.text-sm.italic.text-center.mt-1
          if isEditing
            a(onClick=handleSave) Save

            span.mx-1 /

            a(onClick=handleRevert) Revert
            
            if deleteRound
              span.mx-1 /
              a(onClick=deleteRound) Delete

          else
            a(onClick=toggleEditing)= 'Edit Round '+(round+1)
              
    if isEditing
      .fixed.top-0.left-0.w-screen.h-screen.z-30.base-bgd.bg-opacity-50
  `;
}

Round.propTypes = {
  draftId: PropTypes.string.isRequired,
  round: PropTypes.number.isRequired,
  changeActive: PropTypes.func.isRequired,
  deleteRound: PropTypes.func,
};

export default Round;