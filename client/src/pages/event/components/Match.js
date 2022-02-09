import React, { useRef, useCallback } from "react";
import PropTypes from 'prop-types';

import MatchPlayer from "./MatchPlayer";
import MatchWins from "./MatchWins";
import Report from "./Report";
import Modal from "../../common/Modal";
import Counter from "../../common/Counter";
import RawData from "../../common/RawData";
import { MatchStyle, PlayerStyle, DrawsStyle, WinsStyle } from "../styles/MatchStyles";

import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
  useStatsQuery, useSettingsQuery,
  usePlayerQuery
} from "../event.fetch";

import {
  formatQueryError, swapPlayerMsg
} from '../../../assets/strings';
import { getMatchTitle } from "../services/event.services";
import valid from "../../../assets/validation.json";



function Match({ eventid, matchId, wincount, isEditing }) {
  // Global State
  const { data,           isLoading,                 error              } = useMatchQuery(eventid);
  const { data: rankings, isLoading: loadingRank,    error: rankError   } = useStatsQuery(eventid);
  const { data: players,  isLoading: loadingPlayers, error: playerError } = usePlayerQuery();
  const { data: settings } = useSettingsQuery();

  // Setup
  const reportModal = useRef(null);
  const matchData = data && data[matchId];
  const title = getMatchTitle(matchData, players, isLoading || loadingPlayers);
  
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
  const canSwap = useCallback((types, a, b) => a !== b && types.includes("json/matchplayer"),[]);
  
  
  // Render
  if (isLoading || loadingRank || loadingPlayers || !matchData || error || rankError || playerError)
    return (
      <MatchStyle>
        <div className="m-auto">{
            error || rankError || playerError ?
            formatQueryError(error || rankError || playerError)
            : '. . .'
        }</div>
      </MatchStyle>
    );
  

  // Main
  return (
    <MatchStyle settings={settings}>
      <PlayerStyle>
        { matchData.players.map((playerid, index) => (
          <MatchPlayer
            id={playerid}
            playerData={players[playerid]}
            matchData={matchData}
            handleSwap={handleSwap}
            canSwap={canSwap}
            isEditing={isEditing}
            index={index}
            record={rankings && rankings[playerid] && rankings[playerid].matchRecord}
            key={playerid+'.n'}
          />
        )) }
      </PlayerStyle>

      { matchData.reported &&
        <DrawsStyle hidden={!isEditing && (!matchData.draws || matchData.isbye)}>
          <Counter
            isEditing={isEditing}
            maxVal={valid.limits.match.setDrawsMax || 0}
            setVal={setVal('draws')}
            suff={d=>' draw'+(d===1?'':'s')}
            val={isNaN(matchData.draws) ? matchData.draws : +matchData.draws}
          />
        </DrawsStyle>
      }

      <WinsStyle>
        <MatchWins 
          matchData={matchData}
          wincount={wincount}
          isEditing={isEditing || isReporting}
          clearReport={clearReport}
          setVal={setVal}
          openReport={()=>reportModal.current.open()}
        />
      </WinsStyle>


      <RawData className="text-xs w-80 m-auto" data={matchData} />

      <Modal ref={reportModal}>
        <Report
          eventid={eventid}
          players={players}
          modal={reportModal}
          match={matchData}
          wincount={wincount}
          title={title}
        />
      </Modal>

    </MatchStyle>
  );
}

Match.propTypes = {
  matchId: PropTypes.string,
  eventid: PropTypes.string,
  wincount: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
};

export default Match;
