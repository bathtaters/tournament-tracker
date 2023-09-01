import React from "react"

import Counter from "../../common/Counter"
import { winClass, ByeStyle, WinsSeperator } from "../styles/CounterStyles"
import { ReportButton, ClearReportButton } from "../styles/ButtonStyles"
import { IncompleteStyle } from "../styles/ReportStyles"

import { winValue } from "../services/match.services"

// All win counters
function MatchWins({ matchData, wincount, isEditing, clearReport, setVal, openReport, showReport }) {

  if (!matchData.reported) return (
    showReport ?
      <ReportButton disabled={isEditing} onClick={openReport} />
      :
      <IncompleteStyle />
  )

  return (<>
    { matchData.players.map((id, index) => (
      <WinsBox 
        matchData={matchData}
        wincount={wincount}
        index={index}
        isEditing={isEditing}
        setVal={setVal}
        key={id+'.w'}
      />
    )) }
    { isEditing && <ClearReportButton onClick={clearReport} /> }
  </>)
}

// Each win counter
function WinsBox({ matchData, wincount, index, isEditing, setVal }) {
  if (matchData.players?.length === 1 && !isEditing) return <ByeStyle>Bye</ByeStyle>

  return (<>
    <WinsSeperator visible={index} />

    <Counter
      isEditing={isEditing}
      maxVal={wincount}
      setVal={setVal('wins.'+index)}
      val={winValue(matchData.wins,index)}
      className={winClass(matchData.wins && matchData.wins[index], isEditing, matchData)}
    />
  </>)
}

export default MatchWins