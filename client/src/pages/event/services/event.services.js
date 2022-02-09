// Import
import { roundButtonText, formatMatchTitle } from "../../../assets/strings";

// Round Button label
// [0: N/A, 1: Start, 2: Not Reported, 3: Next, 4: End, 5: Complete]
export const getRoundButton = event => roundButtonText[
  !event ? 0 : event.roundactive === 0 ? 1 :
  event.roundactive > event.roundcount ? 5 :
  event.canadvance === false ? 2 :
  event.roundactive === event.roundcount ? 4 : 3
];

// Get Match Title (To use in ErrMsg & Report dialog)
export const getMatchTitle = (match, players, isLoading=false) =>
  isLoading || !match || !players ? 'Loading' :
    match.players ? formatMatchTitle(match.players, players) :
    console.error('Title error:',match) || 'Untitled';

// Get value for wins counter
export const winValue = (wins, idx) => wins && isNaN(wins[idx]) ? wins[idx] : wins ? +wins[idx] : '-';

// Convert report UI to report Query Body (Append event/match IDs & format Drops)
export const reportAdapter = (reportData, id, eventid) => Object.assign(
  reportData, {
    drops: Object.keys(reportData.drops).reduce((d,p) => reportData.drops[p] ?  d.concat(p) : d,[]),
    eventid, id,
  }
);

// Generate temp round
export const fakeRound = (eventData) => {
  const playerCount = 
    (eventData.players ? eventData.players.length : 0) -
    (eventData.drops ? eventData.drops.length : 0);
  let round = [], size = eventData.playerspermatch ? Math.ceil(playerCount/eventData.playerspermatch) : 0;
  for (let i=0; i<size; i++) {
    round.push('TBD-'+i);
  }
  return round;
};
