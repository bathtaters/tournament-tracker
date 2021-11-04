import React, { useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';

import Modal from "./Components/Modal";
import Day from "./Components/Day";
import EditDraft from "./Components/EditDraft";

import { setSchedule } from "../models/schedule";

function Schedule() {
  const dispatch = useDispatch();

  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [undoData, storeUndo] = useState(null);
  const openDraftModal = useCallback(draftId => { setCurrentDraft(draftId); modal.current.open(); }, [modal]);

  // Global state (TO DO)
  const scheduleData = useSelector(state => state.schedule);

  // Actions
  const resetSchedule = () => {
    if (undoData) dispatch(setSchedule(JSON.parse(undoData)));
    else alert('No data to revert to.');
    storeUndo(null);
    setEdit(false);
  }

  const handleEditClick = () => {
    storeUndo(isEditing ? null : JSON.stringify(scheduleData));
    setEdit(!isEditing);
  }

  return pug`
    div
      .flex.justify-evenly.items-center
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value=(isEditing ? "Revert" : "+")
          onClick=(isEditing ? resetSchedule : ()=>openDraftModal())
        )
        
        h2.inline-block.text-center.font-thin Schedule
        
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value=(isEditing ? "Save" : "Edit")
          onClick=handleEditClick
        )

      .flex.flex-wrap.justify-center.mt-4
        each dayBlock in scheduleData
          Day(
            data=dayBlock
            isEditing=isEditing
            setDraftModal=openDraftModal
            key=(dayBlock.day ? dayBlock.day : -1)
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

export default Schedule;
