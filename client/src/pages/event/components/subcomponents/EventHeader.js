import React from "react";

import { RoundButton } from "../../styles/ButtonStyles";
import LoadingScreen from "../../../common/LoadingScreen";

import useRoundButton from "../../services/roundButton.services";

function EventHeader({ data, disabled }) {
  const { handleClick, buttonText, isFetching } = useRoundButton(data, disabled)

  return (<>
    <RoundButton
      onClick={handleClick}
      value={buttonText}
    />

    <LoadingScreen enable={isFetching} caption="Generating round..." />
  </>)
}

export default EventHeader