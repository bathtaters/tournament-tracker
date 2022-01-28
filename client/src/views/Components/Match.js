import React, { Fragment, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import {
  formatQueryError, formatMatchTitle, formatRecord, swapPlayerMsg, maxDrawsCounter
} from '../../assets/strings';

import Modal from "./Modal";
import DragBlock from "./DragBlock";
import Report from "./Report";
import Counter from "./Counter";
import RawData from "./RawData";

import { useSettingsQuery } from "../../models/baseApi";
import { usePlayerQuery } from "../../models/playerApi";
import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
} from "../../models/matchApi";
import { useStatsQuery } from "../../models/eventApi";


function Match({ eventId, matchId, wincount, isEditing }) {
  // Init
  const reportModal = useRef(null);
  const canSwap = useCallback((types, a, b) => a !== b && types.includes("json/matchplayer"),[]);
  
  // Global State
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useMatchQuery(eventId);
  const { data: rankings, isLoading: loadingRank, error: rankError } = useStatsQuery(eventId);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const matchData = data && data[matchId];
  const title = isLoading || loadingPlayers || !matchData || !players ? 'Loading' :
    matchData.players ? formatMatchTitle(matchData.players, players) :
    console.error('Title error:',matchData) || 'Untitled';
  
  // Change reported values
  const [ update ] = useUpdateMatchMutation();
  const setVal = (baseKey, innerKey=null) => val =>
    update({ id: matchData.id, eventId, [baseKey]: innerKey ? {[innerKey]: val} : val });
  
  // Report match
  const [ report, { isLoading: isReporting } ] = useReportMutation();
  const clearReport = () => {
    if (window.confirm(`Are you sure you want to delete the records for ${title}?`)) {
      report({ id: matchData.id, eventId, clear: true });
    }
  };

  // Swap players
  const [ swapPlayers ] = useSwapPlayersMutation();
  const handleSwap = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    if ((playerA.reported || playerB.reported) && !window.confirm(swapPlayerMsg())) return;
    swapPlayers({eventId, swap: [ playerA, playerB ] });
  };
  
  
// Render
const outerClass = 'm-1 border dim-border rounded-md flex justify-evenly ' + 
  (settings && settings.showrawjson ? 'h-64' : 'h-32');

if (isLoading || loadingRank || loadingPlayers || !matchData || error || rankError || playerError)
  return (
    <div className={outerClass}>
      <div className="m-auto">{
          error || rankError || playerError ?
          formatQueryError(error || rankError || playerError)
          : '...'
      }</div>
    </div>
  );

  // Player's name box
  const playerBox = (playerId, index) => (<Fragment key={playerId+'.n'}>
    { index ?
      <div className="inline-block shrink font-thin text-sm dim-color p-2 align-middle pointer-events-none">
        vs.
      </div>
    : null }

    <DragBlock
      storeData={{ id: matchData.id, playerId, reported: matchData.reported }}
      onDrop={handleSwap}
      canDrop={canSwap}
      storeTestData={matchData.id}
      className="inline-block grow rounded-2xl p-2 mx-1 mb-1"
      dataType="json/matchplayer"
      disabled={!isEditing}
    >

      {/* Name */}
      <h4 className={'mb-0 pb-0 block text-xl ' + (isEditing ? 'pointer-events-none' : '')}>
        
        { isEditing ?
          <span className="link-color font-light">
            {(players[playerId] && players[playerId].name) || '?'}
          </span>

        : players[playerId] ?
          <Link className="font-light" to={'/profile/'+playerId}>
            {players[playerId].name || '?'}
          </Link>
        :
          <div className="font-light link-color" playerid={playerId}>?</div>
        }
      </h4>
      
      {/* Player Info */}
      <div className="text-xs font-thin mt-0 pt-0 pointer-events-none mb-1">
        { matchData.drops.includes(playerId) ?
          <div className="neg-color">Dropped</div>
        :
          <div className="dim-color">
            {formatRecord(rankings && rankings[playerId] && rankings[playerId].matchRecord)}
          </div>
        }

      </div>
    </DragBlock>
  </Fragment>);


  // Player's win counter
  const winsBox = (playerId, index) => (<Fragment key={playerId+'.w'}>
    {/* Divider */}
    { index ? <span className="inline-block">{' – '}</span> : null }

    { matchData.isbye && !isEditing ?
      <div className="pos-color italic font-thin">Bye</div>

    :
      <Counter
        isEditing={isEditing}
        maxVal={wincount}
        setVal={setVal('players', playerId)}
        val={
          matchData.wins && isNaN(matchData.wins[index]) ?
          matchData.wins[index] : matchData.wins ? +matchData.wins[index] : '-'
        }
        className={
          'text-base ' + 
          (isEditing || !matchData.isbye ? '' : 'invisible ') + 
          (matchData.wins && matchData.wins[index] && matchData.wins[index] == matchData.maxwins ? 'pos-color' : '')
        }
      />
    }
  </Fragment>);
  

  // Main
  return (
    <div className={outerClass + ' flex-col relative'}>
      <div className="flex justify-evenly items-center text-center">
        { matchData.players.map(playerBox) }
      </div>

      { matchData.reported &&
        <div
          className={'text-center w-full font-light text-xs base-color -mt-1 ' + (isEditing || (matchData.draws && !matchData.isbye) ? '' : 'invisible')}
        >
          <Counter
            isEditing={isEditing}
            maxVal={maxDrawsCounter || 0}
            setVal={setVal('draws')}
            suff={d=>' draw'+(d===1?'':'s')}
            val={isNaN(matchData.draws) ? matchData.draws : +matchData.draws}
          />
        </div>
      }

      <div className="flex justify-evenly text-center base-color mb-2">
        { matchData.reported ? <>
          { matchData.players.map(winsBox) }
          { isEditing && 
            <div
              className="text-red-500 absolute bottom-0 right-1 text-xs font-thin cursor-pointer hover:neg-color"
              onClick={clearReport}
            >
              ∅
            </div>
          }
        </> :
          <input
            className="block text-xs font-light neg-color mt-1"
            disabled={isEditing || isReporting}
            onClick={()=>reportModal.current.open()}
            type="button"
            value="Report"
          />
        }
      </div>

      <RawData className="text-xs w-80 m-auto" data={matchData} />

      <Modal ref={reportModal}>
        <Report
          eventId={eventId}
          hideModal={()=>reportModal.current.close(true)}
          lockModal={()=>reportModal.current.lock()}
          match={matchData}
          wincount={wincount}
          title={title}
        />
      </Modal>

    </div>
  );
}

Match.propTypes = {
  matchId: PropTypes.string,
  eventId: PropTypes.string,
  wincount: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
