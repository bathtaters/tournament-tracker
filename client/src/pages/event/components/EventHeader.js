import React from "react";

import NotesEditor from "./subcomponents/NotesEditor";
import { RoundButton } from "../styles/ButtonStyles";
import { EventLinkStyle } from "../styles/DashboardStyles";

import useRoundButton from "../services/roundButton.services";

function EventHeader({ data, disabled }) {
  const { handleClick, buttonText } = useRoundButton(data, disabled)

  return (<>
    { data?.link && <EventLinkStyle text={data.link} link={data.link} /> }
    <RoundButton
      onClick={handleClick}
      value={buttonText}
    />
    <NotesEditor id={data.id} notes={data.notes} />
  </>)
}

export default EventHeader