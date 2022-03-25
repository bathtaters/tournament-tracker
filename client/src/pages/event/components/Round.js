import React, { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from 'prop-types';

import Match from '../../match/Match';
import EditRound from './subcomponents/EditRound';
import { RoundStyle, EditRoundStyle } from '../styles/RoundStyles';
import OverlayContainer from '../../common/components/OverlayContainer';

import { useSettingsQuery, refetchStats } from '../event.fetch';


function Round({ data, round, deleteRound }) {
  // Global
  const dispatch = useDispatch();
  const { data: settings } = useSettingsQuery();

  // Local
  const [isEditing, setIsEditing] = useState(false);

  // Refetch Stats
  const setEditing = (isEditing) => {
    !isEditing && dispatch(refetchStats(data.id));
    setIsEditing(isEditing);
  };

  return (<>
    <RoundStyle 
      title={'Round '+(round+1)}
      className={isEditing ? 'z-40' : ''}
      isMissing={!data.matches[round]}
    >
      {(data.matches[round] || []).map((matchId) => 
        <Match
          matchId={matchId}
          eventid={data.id}
          wincount={data.wincount}
          isEditing={isEditing}
          key={matchId}
        />
      )}

      <EditRoundStyle>
        <EditRound 
          roundNum={round}
          setEditing={setEditing}
          deleteRound={deleteRound}
          isEditing={isEditing}
          showAdvanced={settings && settings.showadvanced}
        />
      </EditRoundStyle>
    </RoundStyle>

    {isEditing && <OverlayContainer z={3} />}
  </>);
}

Round.propTypes = {
  data: PropTypes.object.isRequired,
  round: PropTypes.number.isRequired,
  deleteRound: PropTypes.func,
};

export default Round;