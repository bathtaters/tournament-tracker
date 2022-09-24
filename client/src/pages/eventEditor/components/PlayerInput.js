import React, { forwardRef } from "react";

import SuggestText from "../../common/SuggestText/SuggestText";
import { PlayerRowStyle, SuggestTextSpacer } from "../styles/PlayerEditorStyles"
import { PlayerAddButton, PlayerFillButton } from "../styles/PlayerEditorButtons"

import usePlayerInputController from "../services/playerInput.controller";

const PlayerInput = forwardRef(function PlayerInput({autofillSize, hideAutofill, autofill, handlePlayerChange, ...props}, ref) {
  
  const { isHidden, suggestions, submitHandler, addButtonHandler } = usePlayerInputController(props, ref);
  console.log(suggestions)
  return (
    <PlayerRowStyle>

      <PlayerAddButton onClick={addButtonHandler} />
      <PlayerFillButton onClick={autofill} size={autofillSize} hidden={hideAutofill || !isHidden} />

      <SuggestText
        label = "next-player"
        placeholder="Player"
        list={suggestions}
        isHidden={isHidden}
        onChange={handlePlayerChange}
        onSubmit={submitHandler}
        ref={ref}
      />
      <SuggestTextSpacer />

    </PlayerRowStyle>
  );
});

export default PlayerInput;