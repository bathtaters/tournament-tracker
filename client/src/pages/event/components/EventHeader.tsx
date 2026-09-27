import type { EventData } from "types/models";
import NotesEditor from "./subcomponents/NotesEditor";
import { RoundButton } from "../styles/ButtonStyles";
import { EventLinkStyle } from "../styles/DashboardStyles";
import { NotesStyle, NotesWrapperStyle } from "../styles/NoteEditorStyles";

import { useAccessLevel } from "../../../common/General/common.fetch";
import useRoundButton from "../services/roundButton.services";
import { WarningTextStyle } from "../styles/RoundStyles";

export default function EventHeader({
  data,
  disabled,
}: {
  data: EventData;
  disabled: boolean;
}) {
  const { handleClick, buttonText, buttonWarning } = useRoundButton(
    data,
    disabled,
  );
  const { access } = useAccessLevel();

  return (
    <>
      {data?.link && <EventLinkStyle text={data.link} link={data.link} />}

      {access > 1 && <RoundButton onClick={handleClick} value={buttonText} />}

      {access > 1 && buttonWarning && (
        <WarningTextStyle>{buttonWarning}</WarningTextStyle>
      )}

      {access > 1 ? (
        <NotesEditor id={data.id} notes={data.notes} />
      ) : (
        data.notes && (
          <NotesWrapperStyle>
            <NotesStyle disabled={true} value={data.notes} />
          </NotesWrapperStyle>
        )
      )}
    </>
  );
}
