import type { MatchData, MatchReport, Player, Team } from "types/models";
import { formatMatchTitle } from "../../../assets/formatting";
import { debugLogging } from "../../../assets/config";

// Get Match Title (To use in ErrMsg & Report dialog)
export const getMatchTitle = (
  match: MatchData,
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team>,
) => {
  if (players && match?.players)
    return formatMatchTitle(match.players, players, teams);
  debugLogging && console.warn("Invalid Match Title:", match, players);
  return "Untitled";
};

// Get value for wins counter
export const winValue = (wins: MatchData["wins"], idx: number) =>
  wins && isNaN(wins[idx]) ? wins[idx] : wins ? +wins[idx] : null;

// Get suffix for 'draws' counter
export const formatDraws = (draws: MatchData["draws"]) =>
  " draw" + (draws === 1 ? "" : "s");

// Convert report UI to report Query Body (Append event/match IDs & format Drops)
export const reportAdapter = (
  reportData: MatchReport,
  id: MatchData["id"],
  eventid: MatchData["eventid"],
) => ({
  ...reportData,
  drops: Object.keys(reportData.drops).reduce(
    (d, p) => (reportData.drops[p] ? d.concat(p) : d),
    [],
  ),
  eventid,
  id,
});
