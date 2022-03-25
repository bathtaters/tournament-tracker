import React, { forwardRef } from "react";
import PropTypes from 'prop-types';

import PlayerRow from "./PlayerRow";
import PlayerInput from "./PlayerInput";
import { PlayerEditorStyle } from "../styles/PlayerEditorStyles";
import Loading from "../../common/Loading";
import LoadingScreen from "../../common/LoadingScreen";

import usePlayerEditorController from "../services/playerEditor.services";

const PlayerEditor = forwardRef(function PlayerEditor({ players, status, onEdit = null }, ref) {
  // Get data for editor
  const {
    data, playerList, inputData, suggestRef, popPlayer,
    notStarted, isUpdating, isLoading, error,
  } = usePlayerEditorController(players, status, onEdit, ref)

  // Loading/Error catcher
  if (!data) return (
    <PlayerEditorStyle><Loading loading={isLoading} error={error} altMsg="Player data not found" /></PlayerEditorStyle>
  )

  // Render
  return (
    <PlayerEditorStyle playerCount={playerList.length}>

      {playerList.map((pid,idx) => 
        <PlayerRow
          name={data[pid] && data[pid].name}
          isUpdating={isUpdating}
          onClick={notStarted && popPlayer(pid, idx)}
          key={pid}
        />
      )}

      {notStarted &&  <PlayerInput {...inputData} ref={suggestRef} />}

      <LoadingScreen enable={isLoading} caption="Creating player..." />

    </PlayerEditorStyle>
  )
})

PlayerEditor.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  onEdit: PropTypes.func,
}

export default PlayerEditor