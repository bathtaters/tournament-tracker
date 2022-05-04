import React from "react"
import PropTypes from 'prop-types'

import MatchPlayer from "./components/MatchPlayer"
import MatchWins from "./components/MatchWins"
import Report from "./components/Report"

import Modal from "../common/Modal"
import Counter from "../common/Counter"
import RawData from "../common/RawData"
import Loading from "../common/Loading"

import { MatchStyle, PlayerStyle } from "./styles/MatchStyles"
import { DrawsStyle, WinsStyle, drawsClass } from "./styles/CounterStyles"

import reportLayout from "./report.layout"
import { formatDraws } from "./services/match.services"
import useMatchController from "./services/match.controller"


function Match({ eventid, matchId, wincount, isEditing }) {
  // Get component data
  const {
    matchData, rankings, players, settings, title, reportModal,
    setVal, clearReport, report, swapProps, maxDraws, showLoading, error,
  } = useMatchController(eventid, matchId)
  
  // Loading/Error catcher
  if (showLoading) return <MatchStyle><Loading error={error} altMsg=". . ." className="m-auto text-xs" /></MatchStyle>
  
  // Render component
  return (
    <MatchStyle settings={settings}>
      <PlayerStyle>
        { matchData.players.map((playerid, index) => (
          <MatchPlayer
            key={playerid} id={playerid} index={index}
            playerData={players[playerid]}
            record={rankings?.[playerid]?.matchRecord}
            isEditing={isEditing}
            {...swapProps}
          />
        )) }
      </PlayerStyle>

      { matchData.reported &&
        <DrawsStyle hidden={!isEditing && (!matchData.draws || matchData.isbye)}>
          <Counter
            className={drawsClass(isEditing)}
            isEditing={isEditing}
            maxVal={maxDraws}
            suff={formatDraws}
            setVal={setVal('draws')}
            val={+(matchData.draws ?? 0)}
          />
        </DrawsStyle>
      }

      <WinsStyle>
        <MatchWins 
          matchData={matchData}
          wincount={wincount}
          isEditing={isEditing}
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
          report={report}
          layout={reportLayout(matchData.players, players, wincount)}
          modal={reportModal}
        />
      </Modal>

    </MatchStyle>
  )
}

Match.propTypes = {
  matchId: PropTypes.string,
  eventid: PropTypes.string,
  wincount: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
}

export default Match
