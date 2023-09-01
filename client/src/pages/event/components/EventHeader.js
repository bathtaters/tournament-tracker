import React from "react";
import NotesEditor from "./subcomponents/NotesEditor";
import { RoundButton } from "../styles/ButtonStyles";
import { EventLinkStyle } from "../styles/DashboardStyles";
import { NotesStyle, NotesWrapperStyle } from "../styles/NoteEditorStyles";

import { useAccessLevel } from "../../common/common.fetch";
import useRoundButton from "../services/roundButton.services";

function EventHeader({ data, disabled }) {
  const { handleClick, buttonText } = useRoundButton(data, disabled)
  const access = useAccessLevel()

  return (<>
    { data?.link && <EventLinkStyle text={data.link} link={data.link} /> }

    {access > 1 && 
      <RoundButton
        onClick={handleClick}
        value={buttonText}
      />
    }

    {access > 1 ?
      <NotesEditor id={data.id} notes={data.notes} />
      
    : data.notes &&
      <NotesWrapperStyle>
        <NotesStyle disabled={true} value={data.notes} />
      </NotesWrapperStyle>
    }
  </>)
}

export default EventHeader