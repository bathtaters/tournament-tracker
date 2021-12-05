import React from "react";
import { useParams } from "react-router-dom";

import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

import { useDropPlayerMutation } from "../models/matchApi";
import {
  useDraftQuery, useNextRoundMutation, useClearRoundMutation, 
} from "../models/draftApi";

import { getRoundDrops, roundIsDone } from "../controllers/draft";


function Draft() {
  let { id } = useParams();

  // Global
  const { data, isLoading, error } = useDraftQuery(id);
  const matches = (data && data.matches) || [];
  const isDone = roundIsDone(matches);
  
  // Actions
  const [ dropPlayer ] = useDropPlayerMutation();
  const changeActive = (playerIds, undrop) => playerIds.forEach(player => dropPlayer({ draft: id, player, undrop }));
  
  const [ nextRound ] = useNextRoundMutation();
  const [ clearRound ] = useClearRoundMutation();
  const prevRound = () => {
    // undrop players that dropped this round
    changeActive(getRoundDrops(matches[matches.length - 1], data.players), true);
    clearRound(id);
  }
  
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
            disabled=!isDone
            onClick=()=>nextRound(id)
          )

        .flex.flex-row.flex-wrap.justify-evenly  
          if data.players && data.players.length
            DraftStats(title=data.title ranking=data.allPlayers active=data.players)

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
        
        .text-center.font-thin.m-2= JSON.stringify(data)
  `;
}

export default Draft;