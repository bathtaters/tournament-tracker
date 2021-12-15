import React, { useRef } from "react";
import { useParams } from "react-router-dom";

import Round from "./Components/Round";
import DraftStats from "./Components/DraftStats";
import EditDraft from "./Components/EditDraft";
import Modal from "./Components/Modal";

import {
  useDraftQuery, useNextRoundMutation, useClearRoundMutation, 
} from "../models/draftApi";

import { formatQueryError, showRawJson } from "../assets/strings";
import { getRoundButton } from "../controllers/draftHelpers";

function Draft() {
  // Local
  let { id } = useParams();
  const modal = useRef(null);

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
        .flex.flex-row.justify-evenly.items-center
          form.text-center.mt-6.mb-4
            input(
              type="button"
              value=getRoundButton(data)
              disabled=(isFetching || data.canadvance === false)
              onClick=()=>nextRound(id)
            )

          h2.text-center.font-thin= data.title

          form.text-center.mt-6.mb-4
            input(
              type="button"
              value="Settings"
              onClick=()=>modal.current.open()
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
      
        Modal(ref=modal, startLocked=true)
          EditDraft(
            draftId=id
            hideModal=(force=>modal.current.close(force))
          )
  `;
}

export default Draft;