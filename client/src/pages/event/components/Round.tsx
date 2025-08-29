import type { MouseEventHandler } from "react";
import type { EventData } from "types/models";
import OverlayContainer from "pages/common/components/OverlayContainer";
import Match from "pages/match/Match";
import EditRound from "./subcomponents/EditRound";
import { EditRoundStyle, RoundStyle } from "../styles/RoundStyles";
import { useRoundEditor } from "../services/event.services";

type RoundProps = {
  data: EventData;
  round: number;
  deleteRound?: MouseEventHandler<HTMLSpanElement>;
};

export default function Round({ data, round, deleteRound }: RoundProps) {
  const { isEditing, setEditing, showEdit, handleCopy, handleCopySeats } =
    useRoundEditor(data, round);

  return (
    <>
      <RoundStyle
        title={"Round " + (round + 1)}
        className={isEditing ? "z-40" : ""}
        isMissing={!data.matches[round]}
        handleCopy={handleCopy}
        handleCopySeats={handleCopySeats}
      >
        {(data.matches[round] || []).map((matchId) => (
          <Match
            matchId={matchId}
            eventid={data.id}
            wincount={data.wincount}
            isEditing={isEditing}
            key={matchId}
          />
        ))}

        <EditRoundStyle>
          <EditRound
            roundNum={round}
            setEditing={setEditing}
            deleteRound={deleteRound}
            isEditing={isEditing}
            showEdit={showEdit}
          />
        </EditRoundStyle>
      </RoundStyle>

      {isEditing && <OverlayContainer z="z-30" />}
    </>
  );
}
