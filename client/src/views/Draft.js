import React from "react";
import { useParams } from "react-router-dom";

import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

import {
  useDraftQuery, useNextRoundMutation, useClearRoundMutation, 
} from "../models/draftApi";

import { formatQueryError, showRawJson } from "../assets/strings";


function Draft() {
  let { id } = useParams();

  // Global
  const { data, isLoading, error, isFetching } = useDraftQuery(id);
  const matches = (data && data.matches) || [];
  
  // Actions
  const [ nextRound ] = useNextRoundMutation();
  const [ prevRound ] = useClearRoundMutation();
  
  return pug`
    div
      if isLoading
        h3.italic.text-center.font-thin Loading...

      else if error
        h3.italic.text-center.font-thin= formatQueryError(error)

      else if !data
        h3.italic.text-center.font-thin Draft not found

      else
        h2.text-center.font-thin= data.title

        form.text-center.mt-6.mb-4
          input(
            type="button"
            value=(data.roundactive === 0 ? "Start Draft" : "Next Round")
            disabled=(isFetching || data.canadvance === false)
            onClick=()=>nextRound(id)
          )

        .flex.flex-row.flex-wrap.justify-evenly  
          if data.players && data.players.length
            DraftStats(draftId=id)

          - var roundCount = matches.length - 1

          - var roundNum = roundCount + 1

          while roundNum-- > 0
            Round(
              draftId=id
              round=roundNum
              deleteRound=(roundNum === roundCount ? ()=>prevRound(id) : null)
              key=(id+"."+roundNum)
            )
        
        if showRawJson
          .text-center.font-thin.m-2= JSON.stringify(data)
  `;
}

export default Draft;