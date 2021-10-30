
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import SuggestText from "./SuggestText";

const defaultDraftTitle = "New Draft";

function EditDraft({ draft, players, editDraft, hideModal }) {
  const { register, handleSubmit } = useForm();
  const [newPlayer, setNewPlayer] = useState({ visible: false, name: "", id: null });
  const [playerList, setPlayerList] = useState({ ids: draft ? [...(draft.ranking || [])] : [], new: [] });

  const getPlayerId = name => Object.keys(players).find(id => players[id].name === name);

  const newPlayerChange = e => setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id });

  const addPlayer = () => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });
    
    const name = newPlayer.name.trim();
    if (!name) return setNewPlayer({ ...newPlayer, visible: false });

    const pid = newPlayer.id || getPlayerId(name);
    setPlayerList(pid ?
      { ...playerList, ids: playerList.ids.concat(pid) } :
      { ...playerList, new: playerList.new.concat(name) }
    );
    setNewPlayer({ visible: false, name: "" });
  }

  const rmvPlayer = (pid, isNew) => () => {
    const newList = playerList[isNew ? 'new' : 'ids'].slice();
    const rmvIdx = newList.lastIndexOf(pid);
    if (rmvIdx >= 0) newList.splice(rmvIdx,1);
    setPlayerList({ ...playerList,
      [isNew ? 'new' : 'ids']: newList
    });
  };

  const submitDraft = draftData => {
    const newPlayers = newPlayer.visible && !newPlayer.id && newPlayer.name.trim() ?
      playerList.new.concat(newPlayer.name.trim()) : playerList.new;
    draftData.ranking = playerList.ids.concat(newPlayers);
    if (newPlayer.visible && newPlayer.id) draftData.ranking = draftData.ranking.concat(newPlayer.id);
    if (!draftData.title.trim() && !draftData.ranking.length) return hideModal(true);
    if (!draftData.title.trim()) draftData.title = (draft && draft.title) || defaultDraftTitle;
    editDraft({...draft, ...draftData}, newPlayers);
  };

  const playerRow = (name, pid, idx) => (
    <div key={pid || name+idx}>
      <input
        className="my-1 mx-2 text-xs font-light px-0"
        type="button"
        value="–"
        onClick={rmvPlayer(pid || name, !pid)}
      />
      <span className="align-middle">{name}</span>
    </div>
  );
  const oldPlayerRows = playerList.ids.map(pid => playerRow(players[pid] ? players[pid].name || pid : pid, pid));
  const newPlayerRows = playerList.new.map((name,idx) => playerRow(name,null,idx));

  return (
    <div>
      <h3 className="font-light.max-color.text-center.mb-4">{draft ? 'Edit Draft' : 'New Draft'}</h3>
      <form onSubmit={handleSubmit(submitDraft)}>
        <div className="flex flex-wrap-reverse">
          <div className="m-4">
            <h4>Active Players</h4>
            {oldPlayerRows}
            {newPlayerRows}
            <div>
            <input
              className="my-1 mx-2 text-xs font-light px-0"
              type="button"
              value="+"
              onClick={addPlayer}
            />
            <SuggestText
              className={"align-middle" + (newPlayer.visible ? "" : " hidden")}
              suggestClass={newPlayer.visible ? "" : " hidden"}
              value={newPlayer.name}
              onChange={newPlayerChange}
              suggestionList={Object.keys(players).map(id=>({id, value: players[id].name}))}
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
  editDraft: PropTypes.func,
  hideModal: PropTypes.func,
};

export default EditDraft;