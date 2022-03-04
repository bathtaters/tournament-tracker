import React, { useState, forwardRef } from "react";

import SuggestText from "../../common/SuggestText";
import { PlayerRowStyle, suggestClass } from "../styles/PlayerEditorStyles"
import { PlayerAddButton, PlayerFillButton } from "../styles/PlayerEditorButtons"

import { suggestListLayout } from "../eventEditor.layout";
import { onSubmitController } from "../services/playerEditor.services";

const PlayerInput = forwardRef(function PlayerInput({
  data, remainingPlayers, autofillSize, onFirstEdit, hideAutofill,
  pushPlayer, autofill, handlePlayerChange, handleNewPlayer,
}, ref) {

  // Local state
  const [hideSuggest, setHide] = useState(true);

  // Build list
  const suggestions = suggestListLayout(remainingPlayers, data);

  // OnSubmit handler
  const submitHandler = onSubmitController(hideSuggest, setHide, handleNewPlayer, pushPlayer, onFirstEdit);
  
  return (
    <PlayerRowStyle>

      <PlayerAddButton onClick={() => hideSuggest ? setHide(false) : ref.current.submit()} />
      <PlayerFillButton onClick={autofill} size={autofillSize} hidden={hideAutofill || !hideSuggest} />

      <SuggestText
        list={suggestions}
        className={suggestClass.box}
        isHidden={hideSuggest}
        onChange={handlePlayerChange}
        onSubmit={submitHandler}
        ref={ref}
      />
      <span className={suggestClass.spacer} />

    </PlayerRowStyle>
  );
});

export default PlayerInput;