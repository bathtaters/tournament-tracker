import React, { useState, } from "react";
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";

import PlayerEditor from "./PlayerEditor";

import { 
  useDraftQuery, useCreateDraftMutation,
  useDeleteDraftMutation, useUpdateDraftMutation,
} from "../../models/draftApi";

import {
  formatQueryError,
  showRawJson,
  statusInfo,
  duplicatePlayerMsg,
  unsavedPlayerMsg,
  unaddedPlayerMsg,
  deleteDraftMsg
} from "../../assets/strings";

import { emptyNewPlayer, getStatus, limits, defVal } from "../../controllers/draftHelpers";

const settingsRows = [
  { title: 'Title', key: 'title', type: 'title', lockAt: 5,
    calcVal: (title,data) => title.trim() ? title.trim() : (data && data.title) || defVal.title
  },
  { title: 'Total Rounds', key: 'roundCount', type: 'number', lockAt: 3, calcMin: data => data.roundactive },
  { title: 'Best Of', key: 'bestOf', type: 'number' },
  { title: 'Players per Game', key: 'playersPerMatch', type: 'number' },
];





function EditDraft({ draftId, hideModal }) {
  // Global state
  const { data, isLoading, error } = useDraftQuery(draftId, { skip: !draftId });
  const status = !isLoading && getStatus(data);

  // Local state
  const { register, handleSubmit } = useForm();
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const [playerList, setPlayerList] = useState([]);
  
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
    let savedPlayers = [...playerList];
    if (newPlayer.visible && newPlayer.name.trim()) {
      if (newPlayer.id) {
        if (window.confirm(unsavedPlayerMsg(newPlayer.name))) {
          if (playerList.includes(newPlayer.id)) {
            window.alert(duplicatePlayerMsg(newPlayer.name || newPlayer.id || 'New Player'));
            return setNewPlayer(emptyNewPlayer);
          }
          savedPlayers.push(newPlayer.id)
          setPlayerList(savedPlayers);
        }
      } else if (!window.confirm(unaddedPlayerMsg(newPlayer.name))) return;
    }
    setNewPlayer(emptyNewPlayer);
    
    // Build draft object
    if (!draftData.title.trim() && !savedPlayers.length) return hideModal(true);
    if (draftId) draftData.id = draftId;
    draftData.players = savedPlayers;
    settingsRows.forEach(row => {
      if (draftData[row.key.toLowerCase()]) {
        if (row.type === 'number')
          draftData[row.key.toLowerCase()] = +draftData[row.key.toLowerCase()];
      }
      if (row.calcVal)
        draftData[row.key.toLowerCase()] = row.calcVal(draftData[row.key.toLowerCase()], data);
    });

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

  const settingsToRow = (row, data = {}) => (
    <div key={row.key} className="m-4 text-left">
      <h4 className={row.type === 'title' ? "" : "text-sm sm:text-lg font-light"}>
        <label className="mr-2 w-max">{row.title}</label>
        <input
          className="max-color pt-1 px-2"
          type={!row.type || row.type === 'title' ? "text" : row.type}
          min={
            row.calcMin ? row.calcMin(data) :
            limits[row.key] ? limits[row.key].min : undefined }
          max={
            row.calcMax ? row.calcMax(data) :
            limits[row.key] ? limits[row.key].max : undefined }
          defaultValue={
            row.key.toLowerCase() in data ? (
              row.calcVal ? row.calcVal(data[row.key.toLowerCase()], data) : data[row.key.toLowerCase()]
            ) : row.calcVal ? row.calcVal(defVal[row.key], data) : defVal[row.key] }
          disabled={status >= (row.calcLock ? row.calcLock(status,data) : 'lockAt' in row ? row.lockAt : defVal.lockAt)}
          {...register(row.key.toLowerCase())}
        />
      </h4>
    </div>
  );

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">{data ? 'Edit Draft' : 'New Draft'}</h3>
      { status ?
        <h5 className="text-center mb-2">
          <span className="mr-1">Status:</span>
          <span className={"font-thin "+statusInfo[status].class}>{statusInfo[status].label}</span>
        </h5>
      : null }
      <form onSubmit={handleSubmit(submitDraft)}>
        <div className="flex flex-wrap-reverse">
          <PlayerEditor 
            players={data && data.players} status={status}
            newPlayer={newPlayer} setNewPlayer={setNewPlayer}
            playerList={playerList} setPlayerList={setPlayerList}
          />
          <div>
            {settingsRows.map(row => settingsToRow(row, data || {}))}
          </div>
        </div>
        <div className="text-center mt-4">
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="submit"
            value="Save"
          />
          {draftId ?
            (<input
              className="font-normal base-color-inv neg-bgd w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4 opacity-80"
              type="button"
              value="Delete"
              onClick={clickDelete}
            />)
          : null}
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="button"
            value="Cancel"
            onClick={()=>hideModal(true)}
          />
        </div>
      </form>
      {showRawJson ? <p className="font-thin text-sm dim-color mt-4">{JSON.stringify(data)}</p> : null}
    </div>
  );
}

EditDraft.propTypes = {
  draftId: PropTypes.string,
  hideModal: PropTypes.func,
};

export default EditDraft;