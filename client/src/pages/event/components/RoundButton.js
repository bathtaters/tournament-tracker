import React from "react";

import { RoundButtonStyle } from "../styles/EventStyles";

import { useNextRoundMutation } from "../event.fetch";
import { getRoundButton } from "../services/event.services";


function RoundButton({ data, disabled }) {
  const [ nextRound ] = useNextRoundMutation();

  return (
    <RoundButtonStyle>
      <input
        disabled={disabled || data.canadvance === false || data.status > 2}
        onClick={()=>nextRound(data.id)}
        type="button"
        value={getRoundButton(data)}
      />
    </RoundButtonStyle>
  );
}

export default RoundButton;