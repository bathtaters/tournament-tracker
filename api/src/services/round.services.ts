import type { EventDetail, Match, MatchDetail } from "types/models";
import type {
  GenerateData,
  MatchupData,
  OppData,
  TeamData,
} from "types/generators";
import roundRobin from "./matchGenerators/roundRobin";
import swissMonrad from "./matchGenerators/swissMonrad";
import swissDutch from "./matchGenerators/swissDutch";
import elimination from "./matchGenerators/elimination";
import toStats from "./stats.services";
import { enums } from "../config/validation";

const { EventFormat, TeamType } = enums;

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
  teamData?: TeamData,
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
  const ranking =
    eventData.team === TeamType.DISTRIB
      ? Object.values(teamData).flat(1)
      : eventData.players;
  let stats = eventData.roundactive
    ? toStats({ solo: matchData }, ranking, { solo: oppData }, true, true)
    : { ranking, noStats: true };
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
    case EventFormat.ROBIN:
      matchTable = roundRobin(stats, genData);
      break;
    case EventFormat.MONRAD:
      matchTable = swissMonrad(stats, genData);
      break;
    case EventFormat.DUTCH:
      matchTable = swissDutch(stats, genData);
      break;
    case EventFormat.ELIM:
      matchTable = elimination(stats, genData);
      break;
    default:
      throw new Error(`Unknown format ${eventData.format}`);
  }

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
