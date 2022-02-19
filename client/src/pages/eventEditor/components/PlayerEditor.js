import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import PropTypes from 'prop-types';

import PlayerRow from "./PlayerRow";
import PlayerInput from "./PlayerInput";
import { PlayerEditorStyle } from "../styles/PlayerEditorStyles";
import Loading from "../../common/Loading";

import { usePlayerQuery, useCreatePlayerMutation } from "../eventEditor.fetch";
import { 
  getRemaining, pushPlayerController, popPlayerController,
  clickAddController, autofillController,
  newPlayerController, newPlayerChange,
  updateState, retrieveList, 
  emptyNewPlayer, usePreviousArray
} from "../services/playerEditor.services";

import valid from "../../../assets/validation.json";


const PlayerEditor = forwardRef(function PlayerEditor({ players, status, onEdit = null }, ref) {
  // ---------- Init Vars ---------- \\

  // Init Global State
  const { data, isLoading, error, isFetching } = usePlayerQuery();
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  
  // Init Local State
  const [playerList, setPlayerList] = useState([]);
  const [isChanged, setChanged] = useState(!onEdit);
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);

  // Calculated
  const remainingPlayers = getRemaining(data, playerList);
  const prevPlayers = usePreviousArray(players);
  const autofillSize = valid.defaults.settings.autofillsize;

  // ---------- Basic Actions ---------- \\

  // Add player to list
  const pushPlayer = useCallback(
    pushPlayerController(data, playerList, setPlayerList, setNewPlayer), [data, playerList]
  );
  // Remove player from list
  const popPlayer = useCallback(
    popPlayerController(playerList, setPlayerList), [playerList]
  );


  // ---------- Automated Actions ---------- \\
  
  // Run onEdit when first edit is made
  const handleFirstEdit = useCallback(() => { 
    if (!isChanged) { onEdit(); setChanged(true); }
  }, [isChanged, setChanged, onEdit]);

  // Push remote updates to local state
  useEffect(() => {
    updateState(prevPlayers, players, setPlayerList)
  }, [prevPlayers, players, setPlayerList]);

  // Set ref function(s)
  useImperativeHandle(ref, () => ({
    getList: retrieveList(playerList, newPlayer, pushPlayer, setNewPlayer),
    // ...Uncomment below to allow programmatic pushing/popping... //
    // pushPlayer, popPlayer: (pid,idx) => popPlayer(pid,idx)()
  }), [playerList, newPlayer, pushPlayer, popPlayer, setNewPlayer]);


  // Loading/Error catcher
  if (isLoading || error || !data) return (<PlayerEditorStyle>
      <Loading loading={isLoading} error={error} altMsg="No player data found" />
  </PlayerEditorStyle>);


  // ---------- Input Actions ---------- \\
  
  // Load data needed for PlayerInput (Only if it's needed)
  const inputData = status < 2 ? {
    // Args
    data, newPlayer, remainingPlayers, autofillSize,
    showAutofill: playerList.length || newPlayer.visible,

    // Handle SuggestText change
    handlePlayerChange: newPlayerChange(newPlayer, setNewPlayer),
  
    // Handle + button click
    handleAdd: clickAddController(newPlayer, setNewPlayer, createPlayer, pushPlayer, !isChanged && handleFirstEdit),
  
    // Handle autofill click
    autofill: autofillController(remainingPlayers, setPlayerList, autofillSize),
  
    // Handle adding a new player
    handleNewPlayer: name => newPlayerController({ name }, createPlayer, pushPlayer),
  } : {};


  // ---------- Render ---------- \\

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