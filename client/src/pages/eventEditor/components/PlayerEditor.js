import React from "react";
import PropTypes from 'prop-types';

import PlayerRow from "./PlayerRow";
import PlayerInput from "./PlayerInput";
import { PlayerEditorStyle } from "../styles/PlayerEditorStyles";
import Loading from "../../common/Loading";

import usePlayerEditorController from "../services/playerEditor.controller";

function PlayerEditor({ label = 'Players', value, onChange, isStarted, onFirstChange = null }) {
  // Get data for editor
  const {
    data, inputData,
    suggestRef, popPlayer,
    isUpdating, isLoading, error,
  } = usePlayerEditorController(value, onChange, isStarted, onFirstChange)

  // Loading/Error catcher
  if (!data) return (
    <PlayerEditorStyle label={label}><Loading loading={isLoading} error={error} altMsg="Player data not found" /></PlayerEditorStyle>
  )

  // Render
  return (
    <PlayerEditorStyle label={label} playerCount={value?.length}>

      { value?.map((pid,idx) => 
        <PlayerRow
          name={data[pid] && data[pid].name}
          isUpdating={isUpdating}
          onClick={!isStarted && popPlayer(pid, idx)}
          key={pid}
        />
      ) }

      { !isStarted && <PlayerInput {...inputData} ref={suggestRef} /> }

    </PlayerEditorStyle>
  )
}

PlayerEditor.propTypes = {
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  onEdit: PropTypes.func,
}

export default PlayerEditor