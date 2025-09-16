import type { EventDetail, Match, MatchDetail } from "types/models";
import type { MatchupData, OppData } from "types/generators";
import matchGen from "./matchGenerators/swissMonrad";
import toStats from "./stats.services";

type RoundServiceReturn = {
  eventid: Match["eventid"];
  round: Match["round"];
  matches?: Partial<Match>[];
};

/** Builds a new round, based on supplied data. */
export default function roundService(
  eventData: EventDetail,
  matchData: MatchDetail[],
  oppData: OppData,
  allMatchups: MatchupData[],
  autoReportByes = false,
): RoundServiceReturn {
  // Increment round number & create return object
  const matchBase: RoundServiceReturn = {
    round: Math.min(eventData.roundactive, eventData.roundcount) + 1,
    eventid: eventData.id,
  };

  // Event has ended
  if (matchBase.round === eventData.roundcount + 1) return matchBase;

  // Collect data for match generator
  let stats = eventData.roundactive
    ? toStats(
        { solo: matchData },
        eventData.players,
        { solo: oppData },
        true,
        true,
      )
    : { ranking: eventData.players, noStats: true };
  if (!stats.ranking) stats.ranking = [];
  if (eventData.drops?.length)
    stats.ranking = stats.ranking.filter((p) => !eventData.drops.includes(p));

  // Generate match table (Can add more algorithms later)
  const matchTable = matchGen(stats, {
    ...eventData,
    oppData,
    allMatchups,
  });

  // Format for DB write (auto-reporting byes)
  const byeWins = autoReportByes ? eventData.wincount : 0;
  return {
    ...matchBase,

    matches: matchTable.map((match) => ({
      ...matchBase,
      players: match,
      wins: match.map(() => (match.length === 1 ? byeWins : 0)),
      reported: autoReportByes && match.length === 1,
    })),
  };
}
