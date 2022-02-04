import React, { Fragment, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import {
  formatQueryError, formatMatchTitle, formatRecord, swapPlayerMsg, maxDrawsCounter
} from '../../../assets/strings';

import Report from "./Report";
import Modal from "../../shared/Modal";
import DragBlock from "../../shared/DragBlock";
import Counter from "../../shared/Counter";
import RawData from "../../shared/RawData";

import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
} from "../matchApi";
import { useStatsQuery } from "../eventApi";
import { useSettingsQuery } from "../../schedule/baseApi";
import { usePlayerQuery } from "../../players/playerApi";

function Match({ eventid, matchId, wincount, isEditing }) {
  // Init
  const reportModal = useRef(null);
  const canSwap = useCallback((types, a, b) => a !== b && types.includes("json/matchplayer"),[]);
  
  // Global State
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = useMatchQuery(eventid);
  const { data: rankings, isLoading: loadingRank, error: rankError } = useStatsQuery(eventid);
  const { data: players, isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const matchData = data && data[matchId];
  const title = isLoading || loadingPlayers || !matchData || !players ? 'Loading' :
    matchData.players ? formatMatchTitle(matchData.players, players) :
    console.error('Title error:',matchData) || 'Untitled';
  
  // Change reported values
  const [ update ] = useUpdateMatchMutation();
  const setVal = key => value => update({ id: matchData.id, eventid, key, value });
  
  // Report match
  const [ report, { isLoading: isReporting } ] = useReportMutation();
  const clearReport = () => {
    if (window.confirm(`Are you sure you want to delete the records for ${title}?`)) {
      report({ id: matchData.id, eventid, clear: true });
    }
  };

  // Swap players
  const [ swapPlayers ] = useSwapPlayersMutation();
  const handleSwap = (playerA, playerB) => {
    if (playerA.id === playerB.id) return;
    if ((playerA.reported || playerB.reported) && !window.confirm(swapPlayerMsg())) return;
    swapPlayers({eventid, swap: [ playerA, playerB ] });
  };
  
  
// Render
const outerClass = 'm-1 border dim-border rounded-md flex justify-evenly ' + 
  (settings && settings.showadvanced && settings.showrawjson ? 'h-64' : 'h-32');

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
  const playerBox = (playerid, index) => (<Fragment key={playerid+'.n'}>
    { index ?
      <div className="inline-block shrink font-thin text-sm dim-color p-2 align-middle pointer-events-none">
        vs.
      </div>
    : null }

    <DragBlock
      storeData={{ id: matchData.id, playerid, reported: matchData.reported }}
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
            {(players[playerid] && players[playerid].name) || '?'}
          </span>

        : players[playerid] ?
          <Link className="font-light" to={'/profile/'+playerid}>
            {players[playerid].name || '?'}
          </Link>
        :
          <div className="font-light link-color" playerid={playerid}>?</div>
        }
      </h4>
      
      {/* Player Info */}
      <div className="text-xs font-thin mt-0 pt-0 pointer-events-none mb-1">
        { matchData.drops.includes(playerid) ?
          <div className="neg-color">Dropped</div>
        :
          <div className="dim-color">
            {formatRecord(rankings && rankings[playerid] && rankings[playerid].matchRecord)}
          </div>
        }

      </div>
    </DragBlock>
  </Fragment>);


  // Player's win counter
  const winsBox = (playerid, index) => (<Fragment key={playerid+'.w'}>
    {/* Divider */}
    { index ? <span className="inline-block">{' – '}</span> : null }

    { matchData.isbye && !isEditing ?
      <div className="pos-color italic font-thin">Bye</div>

    :
      <Counter
        isEditing={isEditing}
        maxVal={wincount}
        setVal={setVal('wins.'+index)}
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
          eventid={eventid}
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
  eventid: PropTypes.string,
  wincount: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
