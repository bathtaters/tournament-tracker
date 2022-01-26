import React, { useState, useRef, useCallback } from "react";

import Modal from "./Components/Modal";
import Stats from "./Components/Stats";
import NewPlayer from "./Components/AddPlayer";

import { deletePlayerMsg, cantDeletePlayerMsg } from "../assets/strings";

import { useSettingsQuery } from "../models/baseApi";
import { useDeletePlayerMutation } from "../models/playerApi";

function Players() {
  // Init view
  const modal = useRef(null);
  const { data: settings } = useSettingsQuery();
  const [ deletePlayer ] = useDeletePlayerMutation();

  // Local state
  const [canDelete, setDeleteMode] = useState(false);
  const toggleDelete = () => setDeleteMode(!canDelete);
  
  // Actions
  const handlePlayerClick = useCallback((playerId, e, playerData) => {
    if (!canDelete) return; // Pass click
    e.preventDefault();
    // Check player can be deleted
    if (playerData.draftIds && playerData.draftIds.length)
      return window.alert(cantDeletePlayerMsg(playerData.name));
    // Delete player
    if (!window.confirm(deletePlayerMsg(playerData.name))) return;
    deletePlayer(playerId);
  }, [canDelete, deletePlayer]);

  return (
    <div>
      <h2 className="font-thin text-center mb-6">Player Stats</h2>
      <div className="px-6 flex justify-center mb-6">
        <Stats
          className={'neg-border border-2 rounded-md' + (canDelete ? '' : ' border-opacity-0')}
          highlightClass={canDelete ? 'neg-bgd' : ''}
          onPlayerClick={handlePlayerClick}
          hideTeams={true}
        />
      </div>
      <h4 className="text-center">
        <input
          className="m-2 p-lg"
          disabled={canDelete}
          onClick={()=>modal.current.open()}
          type="button"
          value="+"
        />
        { settings && settings.showadvanced ? 
          <input
            className="m-2 p-lg"
            onClick={toggleDelete}
            type="button"
            value={canDelete ? 'x' : '–'}
          />
        : null }
      </h4>
      <Modal ref={modal}>
        <NewPlayer hideModal={force=>modal.current.close(force)} lockModal={()=>modal.current.lock()} />
      </Modal>
    </div>
  );
}

export default Players;
