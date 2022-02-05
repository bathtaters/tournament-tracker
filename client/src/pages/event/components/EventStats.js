import React, { useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import Modal from "../../shared/Modal";
import Stats from "../../stats/Stats";

import { useEventQuery, useStatsQuery, usePlayerQuery } from "../event.fetch";

import { formatQueryError, formatRecord } from '../../../assets/strings';


function EventStats({ eventid }) {
  const modal = useRef(null);
  const { data,          isLoading,                 error              } = useStatsQuery(eventid);
  const { data: event,   isLoading: loadingEvent,   error: eventError  } = useEventQuery(eventid);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const isRanking = data && Array.isArray(data.ranking) && data.ranking.length;
  
  return (
    <div className="m-4">
      <h3 className="font-light text-center">{isRanking ? 'Standings' : 'Players'}</h3>

      { isLoading || loadingEvent || loadingPlayers ?
        <div className="italic text-xs text-center font-thin block mb-2">
          {isLoading ? 'Loading...' : 'N/A'}
        </div>

      : error || eventError || playerError  ?
        <div className="italic text-xs text-center font-thin block mb-2">
          {formatQueryError(error || eventError || playerError)}
        </div>

      : <div>
        <div
          className={'italic text-xs text-center font-thin block mb-2 ' + (isRanking ? 'link' : 'hidden')}
          onClick={isRanking ? ()=>modal.current.open() : null}
        >
          View Stats
        </div>
        <div className="grid grid-flow-row grid-cols-5 gap-x-2 gap-y-1 items-center dim-color">

          { (isRanking ? data.ranking : event.players).map((pid,idx) => 
            <Fragment key={pid}>
              <span
                className={'font-light text-right ' + (event.drops && event.drops.includes(pid) ? 'neg-color' : '')}
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
        <h3 className="font-light max-color text-center mb-4">{event.title+' Stats'}</h3>
        <Stats eventid={eventid} playerList={data && data.ranking} players={players} />
      </Modal>
    </div>
  );
}

EventStats.propTypes = {
  eventid: PropTypes.string.isRequired,
};

export default EventStats;