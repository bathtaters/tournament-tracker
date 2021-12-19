import React, { useState, useRef, useCallback } from "react";

import Modal from "./Components/Modal";
import Day from "./Components/Day";
import EditDraft from "./Components/EditDraft";

import { useScheduleQuery } from "../models/baseApi";
import { useSettingsQuery } from "../models/baseApi";

import { formatQueryError } from "../assets/strings";
import { getMissingDrafts } from "../controllers/getDays";

function Schedule() {
  // Global state
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useScheduleQuery();
  const otherDrafts = getMissingDrafts(data,settings.dateRange);

  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null);
  const openDraftModal = useCallback(draftId => { setCurrentDraft(draftId); modal.current.open(); }, [modal]);

  return pug`
    div
      .flex.justify-evenly.items-center
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value="+"
          onClick=()=>openDraftModal()
          disabled=isLoading
        )
        
        h2.inline-block.text-center.font-thin Schedule
        
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value=(isEditing ? "Back" : "Edit")
          onClick=()=>setEdit(!isEditing)
          disabled=isLoading
        )

      .flex.flex-wrap.justify-center.mt-4
        if isLoading || error
          h4.text-center= !error ? 'Loading...' : formatQueryError(error)
        
        else
          each day in settings.dateRange
            Day(
              drafts=(day === "none" ? otherDrafts : data[day])
              isEditing=isEditing
              setDraftModal=openDraftModal
              day=day
              key=day
            )
      
      if settings && settings.showrawjson
        .text-center.font-thin.m-2= JSON.stringify(data)
      
      Modal(ref=modal, startLocked=true)
        EditDraft(
          draftId=currentDraft
          hideModal=(force=>modal.current.close(force))
        )
  `;
}

export default Schedule;
