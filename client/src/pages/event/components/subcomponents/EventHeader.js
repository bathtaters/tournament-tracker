import React from "react";

import { RoundButton } from "../../styles/ButtonStyles";

import { useNextRoundMutation } from "../../event.fetch";
import { getRoundButton } from "../../services/event.services";


function EventHeader({ data, disabled }) {
  const [ nextRound ] = useNextRoundMutation();

  return (
    <RoundButton
      disabled={disabled || data.canadvance === false || data.status > 2}
      onClick={()=>nextRound(data.id)}
      value={getRoundButton(data)}
    />
  );
}

export default EventHeader;