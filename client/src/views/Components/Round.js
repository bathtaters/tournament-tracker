import React, { useState } from "react";
import PropTypes from 'prop-types';

import Match from './Match';

import { useSettingsQuery } from "../../models/baseApi";
import { useDraftQuery } from "../../models/draftApi";

import { formatQueryError } from "../../assets/strings";

function Round({ draftId, round, deleteRound }) {
  // Global
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useDraftQuery(draftId);

  // Local
  const [isEditing, setEditing] = useState(false);

  return (<>
    <div className={'m-4 relative ' + (isEditing ? 'z-40' : '')}>
      <h3 className="font-light text-center">{'Round '+(round+1)}</h3>
      <div className="flex flex-col">
        { isLoading || error || !data.matches[round] ?
          <div className="dim-color text-center font-thin italic">
            {isLoading ? '...' : error ? formatQueryError(error) : 'Missing'}
          </div>

        : <>
          { data.matches[round].map((matchId, idx) => 
            <Match
              bestOf={data.bestof}
              draftId={draftId}
              isEditing={isEditing}
              key={matchId}
              matchId={matchId}
            />
          ) }

          <div className="font-thin text-sm italic text-center mt-1">
            { isEditing ? <>
              <span className="link" onClick={()=>setEditing(false)}>Back</span>
              
              { deleteRound && <>
                <span className="mx-1">/</span>
                <span className="link" onClick={deleteRound}>Delete</span>
              </> }

            </> : settings && settings.showadvanced &&
              <span className="link" onClick={()=>setEditing(true)}>
                {'Edit Round '+(round+1)}
              </span>

            }
          </div>
        </>}
      </div>

    </div>
    {isEditing &&
      <div className="fixed top-0 left-0 w-screen h-screen z-30 base-bgd bg-opacity-50" />
    }
  </>);
}

Round.propTypes = {
  draftId: PropTypes.string.isRequired,
  round: PropTypes.number.isRequired,
  deleteRound: PropTypes.func,
};

export default Round;