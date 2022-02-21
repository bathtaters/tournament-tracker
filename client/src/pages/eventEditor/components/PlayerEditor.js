import React, { useState, useEffect, useImperativeHandle, forwardRef, useMemo, useCallback } from "react";
import PropTypes from 'prop-types';

import PlayerRow from "./PlayerRow";
import PlayerInput from "./PlayerInput";
import { PlayerEditorStyle } from "../styles/PlayerEditorStyles";
import Loading from "../../common/Loading";

import { usePlayerQuery, useCreatePlayerMutation } from "../eventEditor.fetch";
import { emptyNewPlayer, usePreviousArray } from "../services/playerEditor.utils";
import playerListController, { updateState, retrieveList } from "../services/playerList.services";
import playerEditorController from "../services/playerEditor.services";


const PlayerEditor = forwardRef(function PlayerEditor({ players, status, onEdit = null }, ref) {

  // Global State
  const { data, isLoading, error, isFetching } = usePlayerQuery();
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  
  // Local State
  const [playerList, setPlayerList] = useState([]);
  const [isChanged, setChanged] = useState(!onEdit);
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);

  // Get previous data
  const prevPlayers = usePreviousArray(players);

  // Add/Remove player to/from list
  const { pushPlayer, popPlayer } = playerListController(data, playerList, setPlayerList, setNewPlayer);
  
  // Run onEdit when first edit is made
  const handleFirstEdit = useCallback(() => { if (!isChanged) { onEdit(); setChanged(true); } }, [isChanged, setChanged, onEdit]);

  // Push remote updates to local state
  useEffect(() => { updateState(prevPlayers, players, setPlayerList) }, [prevPlayers, players, setPlayerList]);

  // Assign getList function to ref
  useImperativeHandle(ref,
    () => ({ getList: retrieveList(playerList, newPlayer, pushPlayer, setNewPlayer) }),
    [playerList, newPlayer, pushPlayer, setNewPlayer]
  );


  // Loading/Error catcher
  if (isLoading || error || !data) return (
    <PlayerEditorStyle>
        <Loading loading={isLoading} error={error} altMsg="No player data found" />
    </PlayerEditorStyle>
  );
  
  // Load data needed for PlayerInput (Only if it's needed)
  const inputData = status < 2 ? playerEditorController(data, playerList, newPlayer, setNewPlayer, setPlayerList, createPlayer, pushPlayer, !isChanged && handleFirstEdit) : {};

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

      {status < 2 &&  <PlayerInput {...inputData} />}

    </PlayerEditorStyle>
  );
});

PlayerEditor.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  onEdit: PropTypes.func,
};

export default PlayerEditor;