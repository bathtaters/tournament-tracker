import React, { useRef } from "react";
import PropTypes from 'prop-types';

import MatchPlayer from "./components/MatchPlayer";
import MatchWins from "./components/MatchWins";
import Report from "./components/Report";

import Modal from "../common/Modal";
import Counter from "../common/Counter";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { MatchStyle, PlayerStyle } from "./styles/MatchStyles";
import { DrawsStyle, WinsStyle } from "./styles/CounterStyles";

import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
  useUpdateDropsMutation,
  useStatsQuery, useSettingsQuery,
  usePlayerQuery
} from "./match.fetch";

import reportLayout from "./report.layout";
import { getMatchTitle } from "./services/match.services";
import { swapController, canSwap } from "./services/swap.services";
import { clearReportMsg } from '../../assets/strings';
import valid from "../../assets/validation.json";


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
    if (window.confirm(clearReportMsg(title))) report({ id: matchData.id, eventid, clear: true });
  };

  // Swap players
  const [ swapPlayers ] = useSwapPlayersMutation();
  const handleSwap = swapController(swapPlayers, eventid);

  // (Un)Drop players
  const [ updateDrops ] = useUpdateDropsMutation();
  const handleDrop = (playerid, undrop) => updateDrops({ id: matchId, round: matchData.round, playerid, undrop });

  
  // Loading/Error catcher
  if (isLoading || loadingRank || loadingPlayers || !matchData || error || rankError || playerError)
    return (<MatchStyle>
      <Loading error={error || rankError || playerError} altMsg=". . ." className="m-auto text-xs" />
    </MatchStyle>);
  
  
  // Render
  return (
    <MatchStyle settings={settings}>
      <PlayerStyle>
        { matchData.players.map((playerid, index) => (
          <MatchPlayer
            id={playerid}
            playerData={players[playerid]}
            matchData={matchData}
            handleSwap={handleSwap}
            handleDrop={handleDrop}
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
          title={title}
          match={matchData}
          layout={reportLayout(matchData.players, players, wincount)}
          modal={reportModal}
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
