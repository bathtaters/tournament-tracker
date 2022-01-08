import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

import InputForm from "./InputForm";
import PlayerEditor from "./PlayerEditor";
import RawData from "./RawData";

import { 
  useDraftQuery, useCreateDraftMutation,
  useDeleteDraftMutation, useUpdateDraftMutation,
} from "../../models/draftApi";

import { formatQueryError, statusInfo, deleteDraftMsg } from "../../assets/strings";

import { limits, defaultValues } from "../../controllers/draftHelpers";


// Settings Window Layout/Validation
const lockAt = (statusVal = defaultValues.lockat) => (_,base) => base.draftStatus != null && base.draftStatus >= statusVal;

const settingsRows = [ 'custom', [
  {
    label: 'Title', id: 'title', type: 'text',
    className: "text-base sm:text-xl font-medium m-2",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultValues.title
  },{ 
    label: 'Total Rounds', id: 'roundcount',
    type: 'number', disabled: lockAt(3),
    min: data => data ? data.roundactive : limits.roundcount.min
  },{
    label: 'Best Of', id: 'bestof',
    type: 'number', disabled: lockAt(),
  },{
    label: 'Players per Game', id: 'playerspermatch',
    type: 'number', disabled: lockAt(),
  },
]];


// Component
function EditDraft({ draftId, hideModal, lockModal }) {
  // Init state
  const playerList = useRef(null);
  const { data, isLoading, error } = useDraftQuery(draftId, { skip: !draftId });
  const draftStatus = data ? data.status : 0;
  
  // Delete (& navigate to home page)
  let navigate = useNavigate();
  const [ deleteDraft ] = useDeleteDraftMutation();
  const clickDelete = () => {
    if (!window.confirm(deleteDraftMsg(data && data.title))) return;
    if (draftId) deleteDraft(draftId);
    hideModal(true);
    navigate("/home");
  };
  
  // Submit draft
  const [ createDraft ] = useCreateDraftMutation();
  const [ updateDraft ] = useUpdateDraftMutation();
  const submitDraft = draftData => {
    // Retrieve list from component
    const savedPlayers = playerList.current.getList();
    if (!savedPlayers) return;
    
    // Build draft object
    if (!draftData.title.trim() && !savedPlayers.length) return hideModal(true);
    if (draftId) draftData.id = draftId;
    draftData.players = savedPlayers;

    // Add to DB
    if (!draftId) createDraft(draftData);
    else updateDraft(draftData);
    hideModal(true);
  };


  // Render

  if (isLoading)
    return (<div><h3 className="font-light max-color text-center">Loading...</h3></div>);
  
  else if (error)
    return (<div>
      <h3 className="font-light max-color text-center">{formatQueryError(error)}</h3>
    </div>);

  // Button info - TO MEMOIZE
  const buttons =  draftId ? [
    {
      label: "Delete", onClick: clickDelete,
      className: "font-normal base-color-inv neg-bgd w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4 opacity-80"
    },
    { label: "Cancel", onClick: hideModal }
  ] : [{ label: "Cancel", onClick: hideModal }];

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">{data ? 'Edit Draft' : 'New Draft'}</h3>
      { draftStatus ?
        <h5 className="text-center mb-2">
          <span className="mr-1">Status:</span>
          <span className={"font-thin "+statusInfo[draftStatus].class}>{statusInfo[draftStatus].label}</span>
        </h5>
      : null }
      <InputForm
        rows={settingsRows}
        data={data}
        baseData={{defaultValues, limits, draftStatus}}
        onSubmit={submitDraft}
        onEdit={lockModal}
        buttons={buttons}
        rowFirst={true}
      >
        <PlayerEditor 
          players={data && data.players}
          status={draftStatus}
          onEdit={lockModal}
          ref={playerList}
        />
      </InputForm>
      <RawData className="text-sm mt-4" data={data} />
    </div>
  );
}

EditDraft.propTypes = {
  draftId: PropTypes.string,
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default EditDraft;