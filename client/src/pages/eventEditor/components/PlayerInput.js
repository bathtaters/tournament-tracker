import React, { forwardRef } from "react";

import SuggestText from "../../common/SuggestText";
import { PlayerRowStyle, suggestClass } from "../styles/PlayerEditorStyles"
import { PlayerAddButton, PlayerFillButton } from "../styles/PlayerEditorButtons"

import usePlayerInputController from "../services/playerInput.services";

const PlayerInput = forwardRef(function PlayerInput({autofillSize, hideAutofill, autofill, handlePlayerChange, ...props}, ref) {
  
  const { isHidden, suggestions, submitHandler, addButtonHandler } = usePlayerInputController(props, ref);
  
  return (
    <PlayerRowStyle>

      <PlayerAddButton onClick={addButtonHandler} />
      <PlayerFillButton onClick={autofill} size={autofillSize} hidden={hideAutofill || !isHidden} />

      <SuggestText
        list={suggestions}
        className={suggestClass.box}
        isHidden={isHidden}
        onChange={handlePlayerChange}
        onSubmit={submitHandler}
        ref={ref}
      />
      <span className={suggestClass.spacer} />

    </PlayerRowStyle>
  );
});

export default PlayerInput;