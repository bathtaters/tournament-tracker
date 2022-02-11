// Import
import { formatMatchTitle } from "../../../assets/strings";

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
