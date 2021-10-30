import React, { useState } from "react";
import PropTypes from 'prop-types';
import Match from './Match';
import { swapData } from '../../controllers/swapData';

function Round({ roundNum, matches, players }) {
  const [isEditing, setEditing] = useState(false);

  const [matchData, setMatches] = useState(JSON.parse(JSON.stringify(matches)));

  const resetState = () => { setMatches(JSON.parse(JSON.stringify(matches))); setEditing(false); }

  const setMatch = matchId => data => {
    let newData = [...matchData];
    const idx = newData.findIndex(m => m.id === matchId);
    newData[idx] = data;
    setMatches(newData);
  };

  const swapPlayers = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    const newData = swapData(matchData, 'players', 'id', playerA, playerB, 'playerId');
    setMatches(newData);
  };

  return pug`
    .m-4.relative(className=(isEditing ? "z-40" : ""))
      h3.font-light.text-center= 'Round '+roundNum
      .flex.flex-col
        each match in matchData
          Match(
            key=match.id
            data=match
            players=players
            isEditing=isEditing
            setData=setMatch(match.id)
            swapPlayers=swapPlayers
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
  players: PropTypes.object,
};

export default Round;