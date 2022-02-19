import React from "react";

import SuggestText from "../../common/SuggestText";

import { PlayerInputStyle, suggestClass } from "../styles/PlayerEditorStyles"
import { PlayerAddButton, PlayerFillButton } from "../styles/PlayerEditorButtons"

function PlayerInput({
  data, newPlayer, remainingPlayers, showAutofill, autofillSize,
  autofill, handleAdd, handlePlayerChange, handleNewPlayer,
}) {

  const suggestions = remainingPlayers.map(id=>({id, name: data[id].name}));

  return (
    <PlayerInputStyle>

      <PlayerAddButton onClick={() => handleAdd()} />
      <PlayerFillButton onClick={autofill} size={autofillSize} hidden={showAutofill} />

      <SuggestText
        className={suggestClass.box}
        isHidden={!newPlayer.visible}
        value={newPlayer.name}
        onChange={handlePlayerChange}
        onEnter={handleAdd}
        onStaticSelect={handleNewPlayer}
        suggestionList={suggestions}
        staticList={["Add Player"]}
      />
      <span className={suggestClass.spacer} />

    </PlayerInputStyle>
  );
}

export default PlayerInput;