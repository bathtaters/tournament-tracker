import React, { useState } from "react";
import PropTypes from 'prop-types';
import Match from './Match';
import { swapData } from '../../controllers/swapData';

function Round({ roundNum, matches, setMatches, deleteRound, changeActive, players, }) {
  const [isEditing, setEditing] = useState(false);

  const resetState = () => {
    matches.forEach(m => m.drops && m.drops.length && changeActive(m.drops, false));
    setMatches();
    setEditing(false);
  }

  const setMatch = (matchId, idx) => data => {
    let newData = [...matches];
    if (matchId !== newData[idx].id) idx = newData.findIndex(m => m.id === matchId);
    if (data.drops && data.drops.length) changeActive(data.drops, true);
    newData[idx] = data;
    setMatches(newData);
  };

  const swapPlayers = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    const newData = swapData(matches, 'players', 'id', playerA, playerB, 'playerId');
    setMatches(newData);
  };

  return pug`
    .m-4.relative(className=(isEditing ? "z-40" : ""))
      h3.font-light.text-center= 'Round '+roundNum
      .flex.flex-col
        each match, idx in matches
          Match(
            key=match.id
            data=match
            players=players
            isEditing=isEditing
            setData=setMatch(match.id, idx)
            swapPlayers=swapPlayers
            changeActive=changeActive
          )

        .font-thin.text-sm.italic.text-center.mt-1
          if isEditing
            a(
              onClick=(() => setEditing(false))
            ) Save

            span.mx-1 /

            a(
              onClick=resetState
            ) Revert
            
            if deleteRound
              span.mx-1 /

              a(
                onClick=deleteRound
              ) Delete

          else
            a(
              onClick=(() => setEditing(true))
            )= 'Edit Round '+roundNum

    if isEditing
      .fixed.top-0.left-0.w-screen.h-screen.z-30.base-bgd.bg-opacity-50
  `;
}

Round.propTypes = {
  roundNum: PropTypes.number.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object),
  setMatches: PropTypes.func,
  players: PropTypes.object,
  deleteRound: PropTypes.func,
  changeActive: PropTypes.func,
};

export default Round;