import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";

import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

import { pushRound, popRound } from "../models/drafts";


function Draft() {
  let { id } = useParams();
  const dispatch = useDispatch();

  // Global
  const draft = useSelector(state => state.drafts[id]);
  const matches = (draft && draft.matches) || [];

  // Local
  const [activePlayers, setPlayers] = useState(draft && draft.ranking ? draft.ranking.slice() : []);
  const changeActive = (playerIds, drop) => {
    if (playerIds.length) {
      if (drop) setPlayers(activePlayers.filter(p => !playerIds.includes(p)));
      else setPlayers(activePlayers.concat(playerIds.filter(p => !activePlayers.includes(p))));
    }
  };

  // Actions
  const nextRound = () => dispatch(pushRound({ id, activePlayers }));
  const prevRound = () => {
    matches[matches.length - 1].forEach(m => m.drops && m.drops.length && changeActive(m.drops, false));
    dispatch(popRound(id));
  }

  const isDone = roundNum => !matches.length || (matches[--roundNum] && matches[roundNum].every(m => m.reported));
  
  return pug`
    div
      if draft
        h2.text-center.font-thin= draft.title

        form.text-center.mt-6.mb-4
          input(type="button" value="Next Round" disabled=!isDone(matches.length) onClick=nextRound)

        .flex.flex-row.flex-wrap.justify-evenly
          if draft.ranking && draft.ranking.length
            DraftStats(title=draft.title ranking=draft.ranking active=activePlayers)

          - var roundCount = matches.length - 1

          - var roundNum = roundCount + 1

          while roundNum-- > 0
            Round(
              draftId=id
              round=roundNum
              changeActive=changeActive
              deleteRound=(roundNum === roundCount ? prevRound : null)
              key=(id+"."+roundNum)
            )
      
      else
        h3.italic.text-center.font-thin Draft not found
  `;
}

export default Draft;