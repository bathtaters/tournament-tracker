import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

import SuggestText from "./SuggestText";

import { 
  useGetDraftQuery, useGetPlayerQuery, useCreatePlayerMutation,
  useCreateDraftMutation, useDeleteDraftMutation, useUpdateDraftMutation,
} from "../../controllers/dbApi";

import {
  defaultDraftTitle,
  statusInfo,
  createPlayerMsg,
  duplicatePlayerMsg,
  unsavedPlayerMsg,
  deleteDraftMsg
} from "../../assets/strings";

const emptyNewPlayer = { visible: false, name: "", id: null };


function EditDraft({ draftId, hideModal }) {
  const { register, handleSubmit } = useForm();
  
  // Global state
  const { data: players, isLoading: playersLoading, error: playersError } = useGetPlayerQuery();
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  const { data, isLoading, error } = useGetDraftQuery(draftId, { skip: !draftId });
  const [ createDraft ] = useCreateDraftMutation();
  const [ updateDraft ] = useUpdateDraftMutation();
  const [ deleteDraft ] = useDeleteDraftMutation();

  const status = (!isLoading && data && data.status) || 0;

  // Local state
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const [playerList, setPlayerList] = useState(data && data.players ? [...data.players] : []);
  const newPlayerChange = e => e.target.value !== undefined ? 
    setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
    setNewPlayer({ ...newPlayer, id: e.target.id });

  // Global actions
  const addNewPlayer = async playerInfo => {
    if (!window.confirm(createPlayerMsg(playerInfo.name))) return true;
    const id = await createPlayer(playerInfo).then(r => r.data.id);
    if (!id) throw new Error("Error adding player. ID was not returned upon creation: "+JSON.stringify(playerInfo));
    pushPlayer(id);
  };

  const clickDelete = () => {
    if (!window.confirm(deleteDraftMsg(data && data.title))) return;
    if (draftId) deleteDraft(draftId);
    hideModal(true);
  };
  
  const submitDraft = draftData => {
    // Add player if player has text
    if(newPlayer.visible && newPlayer.name.trim() && window.confirm(unsavedPlayerMsg(newPlayer.name)))
      return clickAdd();

    // Clear player box
    setNewPlayer(emptyNewPlayer);
    
    // Build draft object
    if (draftId) draftData.id = draftId;
    draftData.players = playerList;
    if (!draftData.title.trim()) {
      if (draftData.players.length) draftData.title = (data && data.title) || defaultDraftTitle;
      else return hideModal(true);
    }

    // Add to DB
    if (!draftId) createDraft(draftData);
    else updateDraft(draftData);
    hideModal(true);
  };

  // Local actions
  const clickAdd = (e, override) => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });

    let playerInfo = override || {};
    playerInfo.name = (playerInfo.name || newPlayer.name).trim();
    if (!playerInfo.name) return setNewPlayer({ ...newPlayer, visible: false });

    if (!override) playerInfo.id = newPlayer.id;
    pushPlayer(playerInfo.id);
  }

  const pushPlayer = playerId => {
    if (!playerId) throw new Error("Add player is missing playerId!");

    if (playerList.includes(playerId)) {
      window.alert(duplicatePlayerMsg(players[playerId] && players[playerId].name));
      setNewPlayer(emptyNewPlayer);
      return;
    }
    
    setPlayerList(playerList.concat(playerId));
    setNewPlayer(emptyNewPlayer);
  }
  
  const popPlayer = (pid, idx) => () => {
    const newList = playerList.slice();
    const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
    if (rmvIdx in newList) newList.splice(rmvIdx,1);
    setPlayerList(newList);
  };


  // Render

  if (isLoading || playersLoading)
    return (<div><h3 className="font-light max-color text-center">Loading...</h3></div>);
  
  else if (error || playersError)
    return (<div>
      <h3 className="font-light max-color text-center">Error: {JSON.stringify(error || playersError)}</h3>
    </div>);

  const playerRow = (name, pid, idx) => (
    <div key={pid} className="min-w-40">
      {status < 2 ? <input
        className="my-1 mx-2 text-xs font-light px-0"
        type="button"
        value="–"
        onClick={popPlayer(pid, idx)}
      /> :
      <span className="mx-1">•</span>
      }
      <span className={"align-middle"+(!name ? " italic dim-color" : "")}>
        {name || (playersUpdating ? "..." : "Missing")}
      </span>
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
          <div className="m-4">
            <h4>{`Players (${playerList.length})`}</h4>
            {playerList.map((pid,idx) => playerRow(players[pid] && players[pid].name, pid, idx))}
            {status < 2 ? 
              <div>
                <input
                  className="my-1 mx-2 text-xs font-light px-0"
                  type="button"
                  value="+"
                  onClick={clickAdd}
                />
                <SuggestText
                  className="align-middle"
                  isHidden={!newPlayer.visible}
                  value={newPlayer.name}
                  onChange={newPlayerChange}
                  onEnter={clickAdd}
                  onStaticSelect={name => addNewPlayer({ name })}
                  suggestionList={Object.keys(players).map(id=>({id, name: players[id].name}))}
                  staticList={["Add Player"]}
                />
                <span className="align-middle"></span>
              </div>
            : null}
          </div>
          <div className="m-4 text-center">
            <h4>
              <label className="mr-2 w-max">Title</label>
              <input
                className="max-color pt-1 px-2"
                type="text"
                defaultValue={(data && data.title) || ""}
                {...register("title")}
              />
            </h4>
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
    </div>
  );
}

EditDraft.propTypes = {
  draftId: PropTypes.string,
  hideModal: PropTypes.func,
};

export default EditDraft;