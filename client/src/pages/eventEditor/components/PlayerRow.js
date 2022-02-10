import React from "react";

import { PlayerRowStyle, PlayerNameStyle } from "../styles/PlayerEditorStyles"
import { PlayerRowButton } from "../styles/PlayerEditorButtons"

function PlayerRow({ onClick, name, isUpdating }) {
  return (
    <PlayerRowStyle>
      <PlayerRowButton disabled={!onClick} onClick={onClick} />
      <PlayerNameStyle isMissing={!name}>
        {name || (isUpdating ? "..." : "Missing")}
      </PlayerNameStyle>
    </PlayerRowStyle>
  )
}

export default PlayerRow;