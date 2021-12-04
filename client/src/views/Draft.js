import React from "react";
import { useParams } from "react-router-dom";

import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

import {
  useGetDraftQuery,
  useNextRoundMutation, useClearRoundMutation, useDropPlayerMutation
} from "../controllers/dbApi";

const getMatchDrops = (matchData, remainingPlayers) =>
  Object.keys(matchData.players).filter(p => !remainingPlayers.includes(p));
const getRoundDrops = (roundMatches, remainingPlayers) => roundMatches.reduce(
  (d,m) => d.concat(getMatchDrops(m, remainingPlayers)),
[]);

function Draft() {
  let { id } = useParams();

  // Global
  const { data, isLoading, error } = useGetDraftQuery(id);
  const matches = (data && data.matches) || [];
  const [ nextRound, { isLoading: loadingRound} ] = useNextRoundMutation();
  const [ clearRound ] = useClearRoundMutation();
  const [ dropPlayer, { isLoading: loadingPlayers } ] = useDropPlayerMutation();
  
  // Actions
  const changeActive = (playerIds, undrop) => playerIds.forEach(player => dropPlayer({ draft: id, player, undrop }));
  const prevRound = () => {
    // undrop players that dropped this round
    changeActive(getRoundDrops(matches[matches.length - 1], data.players), true);
    clearRound(id);
  }

  const isDone = roundNum => !matches.length || (matches[--roundNum] && matches[roundNum].every(m => m.reported));
  
  return pug`
    div
      if isLoading
        h3.italic.text-center.font-thin Loading...

      else if error
        h3.italic.text-center.font-thin= 'Error: '+JSON.stringify(error)

      else if !data
        h3.italic.text-center.font-thin Draft not found

      else
        h2.text-center.font-thin= data.title

        form.text-center.mt-6.mb-4
          input(
            type="button"
            value="Next Round"
            disabled=!isDone(matches.length)
            onClick=()=>nextRound(id)
          )

        .flex.flex-row.flex-wrap.justify-evenly  
          if data.players && data.players.length
            DraftStats(title=data.title ranking=(loadingPlayers ? [] : data.allPlayers) active=data.players)

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

          if loadingRound
            .m-4.relative
              h3.font-light.text-center= 'Loading...'
        
        .text-center.font-thin.m-2= JSON.stringify(data)
  `;
}

export default Draft;