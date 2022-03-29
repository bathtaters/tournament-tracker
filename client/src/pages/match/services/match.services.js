import { formatMatchTitle } from "../../../assets/strings"

// Get Match Title (To use in ErrMsg & Report dialog)
export const getMatchTitle = (match, players) =>
  players && match?.players ? formatMatchTitle(match.players, players) :
    console.error('Match Title error:',match,players) || 'Untitled'

    
// Get value for wins counter
export const winValue = (wins, idx) => wins && isNaN(wins[idx]) ? wins[idx] : wins ? +wins[idx] : '-'


// Get suffix for draws counter
export const formatDraws = (draws) => ' draw' + (draws === 1 ? '' : 's')


// Convert report UI to report Query Body (Append event/match IDs & format Drops)
export const reportAdapter = (reportData, id, eventid) => Object.assign(
  reportData, {
    drops: Object.keys(reportData.drops).reduce((d,p) => reportData.drops[p] ?  d.concat(p) : d,[]),
    eventid, id,
  }
)
