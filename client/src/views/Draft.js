import React, { useRef } from "react";
import { useParams } from "react-router-dom";

import Round from "./Components/Round";
import DraftStats from "./Components/DraftStats";
import EditDraft from "./Components/EditDraft";
import Modal from "./Components/Modal";

import { useSettingsQuery } from "../models/baseApi";
import {
  useDraftQuery, useNextRoundMutation, useClearRoundMutation, 
} from "../models/draftApi";

import { deleteRoundMsg, formatQueryError } from "../assets/strings";
import { getRoundButton, getStatus } from "../controllers/draftHelpers";

function Draft() {
  // Local
  let { id } = useParams();
  const modal = useRef(null);

  // Global
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error, isFetching } = useDraftQuery(id);
  const matches = (data && data.matches) || [];
  const status = !isLoading && getStatus(data);
  
  // Actions
  const [ nextRound ] = useNextRoundMutation();
  const [ prevRound ] = useClearRoundMutation();
  const handleDelete = (allow) => () => {
    if (!allow || !window.confirm(deleteRoundMsg)) return;
    prevRound(id)
  }
  
  return pug`
    div
      if isLoading
        h3.italic.text-center.font-thin Loading...

      else if error || data.error
        h3.italic.text-center.font-thin= formatQueryError(error || data.error)

      else if !data
        h3.italic.text-center.font-thin Draft not found

      else
        // .flex.flex-row.justify-evenly.items-center
        
        h2.text-center.font-thin= data.title

        form.text-center.my-4
          input(
            type="button"
            value=getRoundButton(data)
            disabled=(isFetching || data.canadvance === false || status > 2)
            onClick=()=>nextRound(id)
          )

        .flex.flex-row.flex-wrap.justify-evenly
          .text-center.font-light
            h4.font-thin.max-color
              if status === 2
                span.mr-2 Round
                
                span.mr-2.text-lg.font-light(className="sm:text-2xl")= data.roundactive
                
                span.mr-2 of

                span.text-lg.font-light(className="sm:text-2xl")= data.roundcount

              else if status
                span= status === 1 ? 'Not started' : 'Complete'
            
            if data.playerspermatch && data.bestof
              h5.pt-0.italic.dim-color #{data.playerspermatch}-player, best of #{data.bestof}
            
            form.text-center.my-6
              input.dim-color.font-light(
                type="button"
                value="Edit Settings"
                onClick=()=>modal.current.open()
              )

            if data.players && data.players.length
              DraftStats(draftId=id)

          - var roundCount = matches.length - 1

          - var roundNum = roundCount + 1

          while roundNum-- > 0
            Round(
              draftId=id
              round=roundNum
              deleteRound=handleDelete(roundNum === roundCount)
              key=(id+"."+roundNum)
            )
        
        if settings && settings.showrawjson
          .text-center.font-thin.m-2= JSON.stringify(data)
      
        Modal(ref=modal, startLocked=true)
          EditDraft(
            draftId=id
            hideModal=(force=>modal.current.close(force))
          )
  `;
}

export default Draft;