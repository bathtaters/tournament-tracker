import React from "react";

import { RoundButton } from "../../styles/ButtonStyles";

import { useNextRoundMutation } from "../../event.fetch";
import { getRoundButton } from "../../services/event.services";


function EventHeader({ data, disabled }) {
  const [ nextRound ] = useNextRoundMutation();
  const isDisabled = disabled || data.canadvance === false || data.status > 2 || !data.players?.length

  return (
    <RoundButton
      disabled={isDisabled}
      onClick={()=>nextRound(data.id)}
      value={getRoundButton(data)}
    />
  );
}

export default EventHeader;