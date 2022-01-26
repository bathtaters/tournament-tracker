import React, { useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import Modal from "./Modal";
import Stats from "./Stats";

import { usePlayerQuery } from "../../models/playerApi";
import { useDraftQuery, useStatsQuery } from "../../models/draftApi";

import { formatQueryError, formatRecord } from '../../assets/strings';


function DraftStats({ draftId }) {
  const modal = useRef(null);
  const { data,          isLoading,                 error              } = useStatsQuery(draftId);
  const { data: draft,   isLoading: loadingDraft,   error: draftError  } = useDraftQuery(draftId);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const isRanking = data && Array.isArray(data.ranking) && data.ranking.length;
  
  return (
    <div className="m-4">
      <h3 className="font-light text-center">{isRanking ? 'Standings' : 'Players'}</h3>

      { isLoading || loadingDraft || loadingPlayers ?
        <div className="italic text-xs text-center font-thin block mb-2">
          {isLoading ? 'Loading...' : 'N/A'}
        </div>

      : error || draftError || playerError  ?
        <div className="italic text-xs text-center font-thin block mb-2">
          {formatQueryError(error || draftError || playerError)}
        </div>

      : <div>
        <div
          className={'italic text-xs text-center font-thin block mb-2 ' + (isRanking ? 'link' : 'hidden')}
          onClick={isRanking ? ()=>modal.current.open() : null}
        >
          View Stats
        </div>
        <div className="grid grid-flow-row grid-cols-5 gap-x-2 gap-y-1 items-center dim-color">

          { (isRanking ? data.ranking : draft.players).map((pid,idx) => 
            <Fragment key={pid}>
              <span
                className={'font-light text-right ' + (draft.drops && draft.drops.includes(pid) ? 'neg-color' : '')}
              >
                {isRanking ? (idx + 1)+')' : '• '}
              </span>

              { players[pid] ? <>
                <Link className={`col-span-${isRanking? 2:4} text-lg font-normal text-left`} to={'/profile/'+pid}>
                  {players[pid].name}
                </Link>
                {isRanking ? (
                  <span className="col-span-2 text-xs font-light align-middle">
                    {formatRecord(data[pid] && data[pid].matchRecord, false)}
                  </span>
                ) : null }

              </> :
                <span className="col-span-4 text-md font-thin align-middle text-center dim-color italic">
                  – Missing –
                </span>
              }
            </Fragment>
          ) }
        </div>
      </div> }

      <Modal ref={modal}>
        <h3 className="font-light max-color text-center mb-4">{draft.title+' Stats'}</h3>
        <Stats draftId={draftId} playerList={data && data.ranking} players={players} />
      </Modal>
    </div>
  );
}

DraftStats.propTypes = {
  draftId: PropTypes.string.isRequired,
};

export default DraftStats;