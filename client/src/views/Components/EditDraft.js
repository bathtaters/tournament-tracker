import React, { useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";

import InputForm from "./InputForm";
import PlayerEditor from "./PlayerEditor";

import { useSettingsQuery } from "../../models/baseApi";
import { 
  useDraftQuery, useCreateDraftMutation,
  useDeleteDraftMutation, useUpdateDraftMutation,
} from "../../models/draftApi";

import {
  formatQueryError,
  statusInfo,
  duplicatePlayerMsg,
  unsavedPlayerMsg,
  unaddedPlayerMsg,
  deleteDraftMsg
} from "../../assets/strings";

import { emptyNewPlayer, getStatus, limits, defaultValues } from "../../controllers/draftHelpers";


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

const cleanPlayerBox = (playerList,newPlayer) => {
  // Deal with leftover player text in Player Editor
  let savedPlayers = [...playerList];
  if (newPlayer.visible && newPlayer.name.trim()) {
    if (newPlayer.id) {
      if (window.confirm(unsavedPlayerMsg(newPlayer.name))) {
        if (playerList.includes(newPlayer.id)) {
          window.alert(duplicatePlayerMsg(newPlayer.name || newPlayer.id || 'New Player'));
          return; // Clear & Abort
        }
        savedPlayers.push(newPlayer.id)
      }
    } else if (!window.confirm(unaddedPlayerMsg(newPlayer.name))) return false; // Abort
  }
  return savedPlayers; // Continue
}


// Component
function EditDraft({ draftId, hideModal, lockModal }) {
  // Global state
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useDraftQuery(draftId, { skip: !draftId });
  const draftStatus = getStatus(data);

  // Local state
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const [playerList, setPlayerList] = useState([]);
  const [isChanged, setChanged] = useState(false);
  const handleChange = useCallback(() => { 
    if (!isChanged) { lockModal(); setChanged(true); }
  }, [isChanged, setChanged, lockModal]);
  
  // Global actions
  let history = useHistory();
  const [ deleteDraft ] = useDeleteDraftMutation();
  const clickDelete = () => {
    if (!window.confirm(deleteDraftMsg(data && data.title))) return;
    if (draftId) deleteDraft(draftId);
    hideModal(true);
    history.push("/home");
  };
  
  const [ createDraft ] = useCreateDraftMutation();
  const [ updateDraft ] = useUpdateDraftMutation();
  const submitDraft = draftData => {
    // Deal with leftover player text
    const savedPlayers = cleanPlayerBox(playerList, newPlayer);
    if (savedPlayers != null) setNewPlayer(emptyNewPlayer);
    if (!savedPlayers) return;
    setPlayerList(savedPlayers);
    
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
        onEdit={handleChange}
        buttons={buttons}
        rowFirst={true}
      >
        <PlayerEditor 
          players={data && data.players} status={draftStatus}
          newPlayer={newPlayer} setNewPlayer={setNewPlayer}
          playerList={playerList} setPlayerList={setPlayerList}
          handleChange={handleChange}
        />
      </InputForm>
      {settings && settings.showrawjson ? 
      <p className="font-thin text-sm dim-color mt-4">{JSON.stringify(data)}</p> : null}
    </div>
  );
}

EditDraft.propTypes = {
  draftId: PropTypes.string,
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default EditDraft;