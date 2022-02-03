import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import RawData from "./RawData";

import { 
  formatQueryError, formatNum, formatPercent
} from '../../assets/strings';
import { getPlayerList } from "../../controllers/misc";

import { useStatsQuery } from "../../models/eventApi";
import { usePlayerQuery } from "../../models/playerApi";


// Component Layout
const statsHeader = [
  { label: 'Name', get: 'playerName', },
  { label: 'W',   get: data => data.matchRecord && data.matchRecord[0], },
  { label: 'L',   get: data => data.matchRecord && data.matchRecord[1], },
  { label: 'D',   get: data => data.matchRecord && data.matchRecord[2], },
  { label: '%',   get: data => formatPercent(data.gameRate), },
  { label: 'OMW', get: data => formatPercent(data.oppMatch), },
  { label: 'OGW', get: data => formatPercent(data.oppGame), },
];


// Main Component
function Stats({ eventid, onPlayerClick, className, highlightClass, hideTeams }) {
  // Global state
  const { data, isLoading, error } = useStatsQuery(eventid);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const playerList = getPlayerList(data && data.ranking, players, !eventid, hideTeams);

  // Pass clicks to onPlayerClick
  const clickHandler = pid => event => {
    if (typeof onPlayerClick === 'function')
      onPlayerClick(pid, event, {...players[pid], ...data[pid]});
  };
  
  return (
    <div>
      <div className="relative">
        <div className={"grid grid-flow-row grid-cols-stats gap-x-2 gap-y-1 items-center px-4 py-2 "+(className || "")}>
          { statsHeader.map((col,idx) => 
            <span
              className={'font-normal mb-2 text-center ' + ((col.label === 'Name' ? 'col-span-2 ' : 'text-center ') + (col.label.length === 3 ? 'text-xs sm:text-xl' : 'text-xl'))}
              key={'H'+idx}
            >
              {col.label}
            </span>
          ) }

          { isLoading || loadingPlayers ?
            <div className="col-span-8 text-center font-light dim-color">Loading...</div>

          : error || playerError ?
            <div className="col-span-8 text-center font-thin italic dim-color">
              {formatQueryError(error || playerError)}
            </div>

          : playerList.map((pid,idx) => 
            <Fragment key={pid+'S'}>
              <span className="font-light text-right">{idx + 1}</span>
              <Link
                className="text-lg font-normal text-left"
                onClick={clickHandler(pid)}
                to={'/profile/'+pid}
              >
                {(players[pid] && players[pid].name) || '-'}
              </Link>

              { statsHeader.slice(1).map((col,i) => 
                <span className="text-sm font-thin text-center" key={pid+'C'+i}>
                  {formatNum(data[pid] && col.get && col.get(data[pid]))}
                </span>
                
              ) }
            </Fragment>
          )}
        </div>

        { !isLoading && !loadingPlayers && !error && !playerError ? 
          <div
            className="grid grid-flow-row grid-cols-1 gap-x-2 gap-y-1 py-2 items-center absolute top-0 left-0 right-0 bottom-0 z-0"
          >
            <div className="w-full h-full opacity-75 mb-2 bg-none" />
            { playerList.map((pid, idx) => 
              <Link
                className={'w-full h-full px-2 opacity-0 base-bgd-inv ' + (highlightClass+' hover:opacity-25')}
                key={pid+'_L'}
                onClick={clickHandler(pid)}
                to={'/profile/'+pid}
              />
            ) }
          </div>

        : null }
      </div>

      <RawData className="text-sm" data={data} />
    </div>
  );
}

Stats.propTypes = {
  eventid: PropTypes.string,
  onPlayerClick: PropTypes.func,
  className: PropTypes.string,
  highlightClass: PropTypes.string,
};

export default Stats;