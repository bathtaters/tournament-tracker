import type { EventDetail, Match, MatchDetail } from "types/models";
import type {
  GenerateData,
  MatchupData,
  OppData,
  Stats,
  TeamData,
} from "types/generators";
import generateRoundRobin from "./matchGenerators/roundRobin";
import generateSwiss from "./matchGenerators/swiss";
import generateElimination, {
  getEliminated,
} from "./matchGenerators/elimination";
import toStats from "./stats.services";

type RoundServiceReturn = {
  eventid: Match["eventid"];
  round: Match["round"];
  drops?: Pick<Match, "id" | "drops">[];
  matches?: Partial<Match>[];
};

/** Builds a new round, based on supplied data. */
export default function roundService(
  eventData: EventDetail,
  matchData: MatchDetail[],
  oppData: OppData,
  allMatchups: MatchupData[],
  teamData?: TeamData,
  autoReportByes = false,
): RoundServiceReturn {
  // Increment round number & create return object
  const matchBase: Omit<RoundServiceReturn, "drops"> = {
    round: Math.min(eventData.roundactive, eventData.roundcount) + 1,
    eventid: eventData.id,
  };

  // Event has ended
  if (matchBase.round === eventData.roundcount + 1) return matchBase;

  // Collect data for match generator
  const ranking =
    eventData.team === "DISTRIB"
      ? Object.values(teamData).flat(1)
      : eventData.players;

  let stats: Stats = eventData.roundactive
    ? toStats({ solo: matchData }, ranking, { solo: oppData }, true, true)
    : { ranking, noStats: true };

  // Handle prior round eliminations
  let drops: RoundServiceReturn["drops"];
  if (eventData.format === "ELIM" && !stats.noStats) {
    // Format drops for database
    drops = getEliminated(eventData, matchData, stats);
    // Hide players for round pairing
    eventData.drops = [
      ...eventData.drops,
      ...drops.flatMap(({ drops }) => drops),
    ];
  }

  if (!stats.ranking) stats.ranking = [];
  if (eventData.drops?.length)
    stats.ranking = stats.ranking.filter((p) => !eventData.drops.includes(p));

  const genData: GenerateData = {
    ...eventData,
    teamData,
    oppData,
    allMatchups,
  };

  // Generate match table (Can add more algorithms later)
  let matchTable: string[][];
  switch (eventData.format) {
    case "ROBIN":
      matchTable = generateRoundRobin(stats, genData);
      break;
    case "MONRAD":
      matchTable = generateSwiss(stats, genData, false);
      break;
    case "DUTCH":
      matchTable = generateSwiss(stats, genData, true);
      break;
    case "ELIM":
      const lastRound = matchData.filter(
        ({ round }) => round === eventData.roundactive,
      );
      matchTable = generateElimination(stats, genData, lastRound);
      break;
    default:
      throw new Error(`Unknown format ${eventData.format}`);
  }

  // Format for DB write (auto-reporting byes)
  const byeWins = autoReportByes ? eventData.wincount : 0;
  return {
    ...matchBase,
    drops,

    matches: matchTable.map((match) => ({
      ...matchBase,
      players: match,
      wins: match.map(() => (match.length === 1 ? byeWins : 0)),
      reported: autoReportByes && match.length === 1,
    })),
  };
}
