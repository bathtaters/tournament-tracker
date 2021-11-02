
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import SuggestText from "./SuggestText";

import { findObj } from "../../controllers/misc";
import {
  defaultDraftTitle,
  createPlayerMsg,
  duplicatePlayerMsg,
  unsavedPlayerMsg
} from "../../assets/strings";

const emptyNewPlayer = { visible: false, name: "", id: null };

function EditDraft({ draft, players, editDraft, createPlayer, hideModal }) {
  const { register, handleSubmit } = useForm();
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const [playerList, setPlayerList] = useState(draft && draft.ranking ? [...draft.ranking] : []);

  const newPlayerChange = e => e.target.value !== undefined ? 
    setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
    setNewPlayer({ ...newPlayer, id: e.target.id });

  const addPlayer = (e,withChange) => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });

    const name = (withChange && withChange.name ? withChange.name : newPlayer.name).trim();
    if (!name) return setNewPlayer({ ...newPlayer, visible: false });

    const pid = (withChange ? withChange.id : newPlayer.id) || findObj(players, name, 'name');
    if (!pid) return addNewPlayer(e, name);

    if (playerList.includes(pid)) {
      window.alert(duplicatePlayerMsg(name));
      setNewPlayer(emptyNewPlayer);
      return;
    }
    
    setPlayerList(playerList.concat(pid));
    setNewPlayer(emptyNewPlayer);
  }

  const addNewPlayer = (e, name) => {
    if (!window.confirm(createPlayerMsg(name))) return true;
    const id = createPlayer({ name });
    addPlayer(null, {id, name});
    return false;
  };

  const rmvPlayer = (pid, isNew) => () => {
    const newList = playerList[isNew ? 'new' : 'ids'].slice();
    const rmvIdx = newList.lastIndexOf(pid);
    if (rmvIdx >= 0) newList.splice(rmvIdx,1);
    setPlayerList({ ...playerList,
      [isNew ? 'new' : 'ids']: newList
    });
  };

  const submitDraft = draftData => {
    if(newPlayer.visible && newPlayer.name.trim() && window.confirm(unsavedPlayerMsg(newPlayer.name)))
      return addPlayer();

    setNewPlayer(emptyNewPlayer);
    
    draftData.ranking = playerList;
    if (!draftData.title.trim() && !draftData.ranking.length) return hideModal(true);
    if (!draftData.title.trim()) draftData.title = (draft && draft.title) || defaultDraftTitle;
    editDraft({...draft, ...draftData});
  };

  const playerRow = (name, pid) => (
    <div key={pid}>
      <input
        className="my-1 mx-2 text-xs font-light px-0"
        type="button"
        value="–"
        onClick={rmvPlayer(pid)}
      />
      <span className="align-middle">{name}</span>
    </div>
  );

  return (
    <div>
      <h3 className="font-light.max-color.text-center.mb-4">{draft ? 'Edit Draft' : 'New Draft'}</h3>
      <form onSubmit={handleSubmit(submitDraft)}>
        <div className="flex flex-wrap-reverse">
          <div className="m-4">
            <h4>Active Players</h4>
            {playerList.map(pid => playerRow(players[pid] && players[pid].name ? players[pid].name : pid, pid))}
            <div>
              <input
                className="my-1 mx-2 text-xs font-light px-0"
                type="button"
                value="+"
                onClick={addPlayer}
              />
              <SuggestText
                className="align-middle"
                isHidden={!newPlayer.visible}
                value={newPlayer.name}
                onChange={newPlayerChange}
                onEnter={addPlayer}
                onStaticSelect={addNewPlayer}
                suggestionList={Object.keys(players).map(id=>({id, name: players[id].name}))}
                staticList={["Add Player"]}
              />
              <span className="align-middle"></span>
            </div>
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
  draft: PropTypes.object,
  players: PropTypes.object,
  createPlayer: PropTypes.func,
  editDraft: PropTypes.func,
  hideModal: PropTypes.func,
};

export default EditDraft;