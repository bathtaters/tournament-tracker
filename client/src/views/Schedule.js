import React, { useState, useRef, useCallback } from "react";

import Modal from "./Components/Modal";
import Day from "./Components/Day";
import EditDraft from "./Components/EditDraft";
import RawData from "./Components/RawData";

import { useScheduleQuery, useSettingsQuery } from "../models/baseApi";
import { useDraftQuery } from "../models/draftApi";

import { formatQueryError } from "../assets/strings";
import { getMissingDrafts } from "../controllers/getDays";

function Schedule() {
  // Global state
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useScheduleQuery();
  
  const { data: draftData } = useDraftQuery();
  const otherDrafts = getMissingDrafts(data,settings.dateRange);

  // Local state
  const modal = useRef(null);
  const [isEditing, setEdit] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null);
  const openDraftModal = useCallback(draftId => { console.log('MODAL',draftId); setCurrentDraft(draftId); modal.current.open(); }, [modal]);

  return (
    <div>
      <div className="flex justify-evenly items-center">
        <input
          className="sm:w-20 sm:h-11"
          disabled={isLoading}
          onClick={()=>openDraftModal()}
          type="button"
          value="+"
        />
        <h2 className="inline-block text-center font-thin">Schedule</h2>
        <input
          className="sm:w-20 sm:h-11"
          disabled={isLoading}
          onClick={()=>setEdit(!isEditing)}
          type="button"
          value={isEditing ? 'Back' : 'Edit'}
        />
      </div>

      <div className="flex flex-wrap justify-center mt-4">
        { isLoading || error || !settings ?
          <h4 className="text-center">{isLoading ? 'Loading...' : formatQueryError(error || 'Unable to reach server')}</h4>
        :
          settings.dateRange && settings.dateRange.map(day => 
            <Day
              day={day}
              drafts={day === 'none' ? otherDrafts : data[day]}
              isEditing={isEditing}
              key={day}
              setDraftModal={openDraftModal}
            />
          )
        }
      </div>

      <RawData data={data} />
      <RawData className="text-xs" data={draftData} />

      <Modal ref={modal}>
        <EditDraft
          draftId={currentDraft}
          hideModal={force=>modal.current.close(force)}
          lockModal={()=>modal.current.lock()}
        />
      </Modal>
    </div>
  );
}

export default Schedule;
