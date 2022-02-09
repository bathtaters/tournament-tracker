import React, { useState } from "react";
import PropTypes from 'prop-types';

import { RoundStyle, EditRoundStyle } from '../styles/EventStyles';
import Match from './Match';
import EditRound from './EditRound';
import OverlayContainer from '../../common/styles/OverlayContainer';

import { useSettingsQuery } from '../event.fetch';


function Round({ data, round, deleteRound }) {
  // Global
  const { data: settings } = useSettingsQuery();

  // Local
  const [isEditing, setEditing] = useState(false);

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