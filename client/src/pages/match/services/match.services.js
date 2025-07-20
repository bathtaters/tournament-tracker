import { formatMatchTitle } from "../../../assets/formatting"
import { debugLogging } from "../../../assets/config"

// Get Match Title (To use in ErrMsg & Report dialog)
export const getMatchTitle = (match, players) =>
  players && match?.players ? formatMatchTitle(match.players, players) :
    (debugLogging && console.warn('Invalid Match Title:',match,players)) || 'Untitled'

    
// Get value for wins counter
export const winValue = (wins, idx) => wins && isNaN(wins[idx]) ? wins[idx] : wins ? +wins[idx] : '-'


// Get suffix for draws counter
export const formatDraws = (draws) => ' draw' + (draws === 1 ? '' : 's')


// Convert report UI to report Query Body (Append event/match IDs & format Drops)
export const reportAdapter = (reportData, id, eventid) => ({
  ...reportData,
  drops: Object.keys(reportData.drops).reduce((d,p) => reportData.drops[p] ?  d.concat(p) : d,[]),
  eventid, id,
})
