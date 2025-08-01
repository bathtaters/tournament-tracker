import React from "react";
import PropTypes from "prop-types";

import Match from "../../match/Match";
import EditRound from "./subcomponents/EditRound";
import { RoundStyle, EditRoundStyle } from "../styles/RoundStyles";
import OverlayContainer from "../../common/components/OverlayContainer";

import { useRoundEditor } from "../services/event.services";

function Round({ data, round, deleteRound }) {
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

Round.propTypes = {
  data: PropTypes.object.isRequired,
  round: PropTypes.number.isRequired,
  deleteRound: PropTypes.func,
};

export default Round;
