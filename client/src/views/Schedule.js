import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";

import Modal from "./Components/Modal";
import Day from "./Components/Day";
import EditDraft from "./Components/EditDraft";

import { useScheduleQuery } from "../models/baseApi";

function Schedule({ range }) {
  // Global state (TO DO)
  const { data, isLoading, error } = useScheduleQuery();

  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null);
  const openDraftModal = useCallback(draftId => { setCurrentDraft(draftId); modal.current.open(); }, [modal]);

  // Actions
  const handleEditClick = () => {
    // storeUndo(isEditing ? null : JSON.stringify(scheduleData));
    setEdit(!isEditing);
  }

  return pug`
    // div= JSON.stringify(data)
    // div= JSON.stringify(range)
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
          onClick=handleEditClick
          disabled=isLoading
        )

      .flex.flex-wrap.justify-center.mt-4
        if isLoading || error
          h4.text-center= !error ? 'Loading...' : 'ERROR: '+JSON.stringify(error)
        
        else
          each day in range
            Day(
              drafts=data[day]
              isEditing=isEditing
              setDraftModal=openDraftModal
              day=day
              key=day
            )
      
      .mt-8.text-xs.dim-color.font-light
        p To add -- tiny edit button to edit main Title/Date Range (Changes require reload)
      
      Modal(ref=modal, startLocked=true)
        EditDraft(
          draftId=currentDraft
          hideModal=(force=>modal.current.close(force))
        )
  `;
}

Schedule.propTypes = { range: PropTypes.arrayOf(PropTypes.string) }

export default Schedule;
