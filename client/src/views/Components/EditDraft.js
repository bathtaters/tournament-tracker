// TEST DATA
import { newId, draftStatus } from "../../controllers/testing/testDataAPI";

import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

import SuggestText from "./SuggestText";
import { addToDay } from '../../models/schedule';
import { addPlayer } from '../../models/players';
import { addDraft, rmvDraft, updateDraft } from '../../models/drafts';

import { findObj } from "../../controllers/misc";
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
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  
  // Global state
  const players = useSelector(state => state.players);
  const drafts = useSelector(state => state.drafts); // for newId only
  const draft = draftId ? drafts[draftId] : null;
  const status = draftStatus(draft);

  // Local state
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const [playerList, setPlayerList] = useState(draft && draft.ranking ? [...draft.ranking] : []);
  const newPlayerChange = e => e.target.value !== undefined ? 
    setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
    setNewPlayer({ ...newPlayer, id: e.target.id });

  // Global actions
  const createPlayer = playerInfo => {
    if (!window.confirm(createPlayerMsg(playerInfo.name))) return true;
    const id = newId(playerInfo.name.trim().charAt(0).toLowerCase()+'x', players);
    if (!id)  throw new Error("Error adding player. ID was not returned upon creation: "+JSON.stringify(playerInfo));

    dispatch(addPlayer({ ...playerInfo, id }));
    pushPlayer({ ...playerInfo, id });
  };

  const deleteDraft = () => {
    if (!window.confirm(deleteDraftMsg(draft && draft.title))) return;
    dispatch(rmvDraft(draftId));
    hideModal(true);
  };
  
  const submitDraft = draftData => {
    if(newPlayer.visible && newPlayer.name.trim() && window.confirm(unsavedPlayerMsg(newPlayer.name)))
      return clickAdd();

    setNewPlayer(emptyNewPlayer);
    
    draftData.ranking = playerList;
    if (!draftData.title.trim() && !draftData.ranking.length) return hideModal(true);
    if (!draftData.title.trim()) draftData.title = (draft && draft.title) || defaultDraftTitle;
    draftData.id = draftId || newId('d', drafts);

    if (!draftId) {
      // Create new draft & add to "Unscheduled"
      dispatch(addToDay(draftData.id));
      dispatch(addDraft(draftData));
    } else {
      // Update existing draft
      dispatch(updateDraft(draftData));
    }
    hideModal(true);
  };

  // Local actions
  const clickAdd = (e, override) => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });

    let playerInfo = override || {};
    playerInfo.name = (playerInfo.name || newPlayer.name).trim();
    if (!playerInfo.name) return setNewPlayer({ ...newPlayer, visible: false });

    if (!override) playerInfo.id = newPlayer.id;
    pushPlayer(playerInfo);
  }

  const pushPlayer = playerInfo => {
    if (!playerInfo.id) playerInfo.id = findObj(players, playerInfo.name, 'name');
    if (!playerInfo.id) return createPlayer(playerInfo);

    if (playerList.includes(playerInfo.id)) {
      window.alert(duplicatePlayerMsg(playerInfo.name));
      setNewPlayer(emptyNewPlayer);
      return;
    }
    
    setPlayerList(playerList.concat(playerInfo.id));
    setNewPlayer(emptyNewPlayer);
  }
  
  const popPlayer = (pid, idx) => () => {
    const newList = playerList.slice();
    const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
    if (rmvIdx in newList) newList.splice(rmvIdx,1);
    setPlayerList(newList);
  };


  // Render

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
      <span className={"align-middle"+(!name ? " italic dim-color" : "")}>{name || "Missing"}</span>
    </div>
  );

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">{draft ? 'Edit Draft' : 'New Draft'}</h3>
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
                  onStaticSelect={name => createPlayer({ name })}
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
                defaultValue={(draft && draft.title) || ""}
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
              onClick={deleteDraft}
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