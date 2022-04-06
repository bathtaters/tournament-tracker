import React from "react";

import NotesEditor from "./subcomponents/NotesEditor";
import { RoundButton } from "../styles/ButtonStyles";

import useRoundButton from "../services/roundButton.services";

function EventHeader({ data, disabled }) {
  const { handleClick, buttonText } = useRoundButton(data, disabled)

  return (<>
    <RoundButton
      onClick={handleClick}
      value={buttonText}
    />
    <NotesEditor id={data.id} notes={data.notes} />
  </>)
}

export default EventHeader