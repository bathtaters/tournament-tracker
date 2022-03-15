import React, { useState, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import PropTypes from 'prop-types';

import PlayerRow from "./PlayerRow";
import PlayerInput from "./PlayerInput";
import { PlayerEditorStyle } from "../styles/PlayerEditorStyles";
import Loading from "../../common/Loading";

import { usePlayerQuery, useSettingsQuery, useCreatePlayerMutation } from "../eventEditor.fetch";
import playerInputController from "../services/playerEditor.services";
import playerListController, { retrieveList } from "../services/playerList.services";
import { usePropState } from "../services/playerEditor.utils";


const PlayerEditor = forwardRef(function PlayerEditor({ players, status, onEdit = null }, ref) {

  // Global State
  const { data, isLoading, error, isFetching } = usePlayerQuery();
  const { data: settings, isLoading: settLoad, error: settErr } = useSettingsQuery();
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  
  // Local State
  const suggestRef = useRef(null);
  const [playerList, setPlayerList] = useState(players || []);
  const [isChanged, setChanged] = useState(!onEdit);

  // Push remote updates to local state - UNTESTED
  usePropState(players, setPlayerList);

  // Add/Remove player to/from list
  const { pushPlayer, popPlayer } = playerListController(data, playerList, setPlayerList);
  
  // Run onEdit once, when first edit is made
  const onFirstEdit = useCallback(isChanged ? null : () => { onEdit(); setChanged(true); }, [isChanged, setChanged, onEdit]);

  // Assign getList function to ref
  useImperativeHandle(ref,
    () => ({ getList: retrieveList(playerList, suggestRef) }),
    [playerList]
  );


  // Loading/Error catcher
  if (isLoading || settLoad || error || settErr || !data) return (
    <PlayerEditorStyle>
        <Loading loading={isLoading || settLoad} error={error || settErr} altMsg="No player data found" />
    </PlayerEditorStyle>
  );
  
  // Load data needed for PlayerInput (Only if it's needed)
  const inputData = status < 2 ? playerInputController({
    data, playerList, setPlayerList, createPlayer, pushPlayer, onFirstEdit, autofillSize: settings?.autofillsize
  }) : {};

  // Render
  return (
    <PlayerEditorStyle playerCount={playerList.length}>

      {playerList.map((pid,idx) => 
        <PlayerRow
          name={data[pid] && data[pid].name}
          isUpdating={playersUpdating || isFetching}
          onClick={status < 2 && popPlayer(pid, idx)}
          key={pid}
        />
      )}

      {status < 2 &&  <PlayerInput {...inputData} ref={suggestRef} />}

    </PlayerEditorStyle>
  );
});

PlayerEditor.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  onEdit: PropTypes.func,
};

export default PlayerEditor;