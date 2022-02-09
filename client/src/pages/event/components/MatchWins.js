import React from "react";

import Counter from "../../common/Counter";
import { winClass, ByeStyle } from "../styles/MatchStyles";
import { ReportButton, ClearReportButton } from "../styles/EventButtons";

import { winValue } from "../services/event.services";

// Main
function MatchWins({ matchData, wincount, isEditing, clearReport, setVal, openReport }) {

  if (!matchData.reported)
    return (<ReportButton disabled={isEditing} onClick={openReport} />);

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
  </>);
}

// Each win counter
function WinsBox({ matchData, wincount, index, isEditing, setVal }) {
  if (matchData.isbye && !isEditing) return (<ByeStyle>Bye</ByeStyle>);

  return (<>
    { index !== 0 && <span className="inline-block">{' – '}</span> }

    <Counter
      isEditing={isEditing}
      maxVal={wincount}
      setVal={setVal('wins.'+index)}
      val={winValue(matchData.wins,index)}
      className={winClass(matchData.wins && matchData.wins[index], isEditing, matchData)}
    />
  </>);
}

export default MatchWins;