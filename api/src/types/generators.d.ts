import type {
  Event,
  EventDetail,
  MatchupData,
  OppData,
  Player,
  Stats,
  Team,
} from "./models";
import type { PlayerRecord } from "./base";

export type StatsEntry = {
  eventids: Event["id"][];
  matchRecord: PlayerRecord;
  gameRecord: PlayerRecord;
  matchScore: number;
  gameScore: number;
  matchRate: number;
  gameRate: number;
  oppMatch: number;
  oppGame: number;
};

export type StatsEntryBase = Pick<StatsEntry, "matchScore" | "gameScore"> & {
  eventIdSet: Set<string>;
  matchRecord: number[];
  gameRecord: number[];
};

export type StatsEntryRates = StatsEntryBase &
  Pick<StatsEntry, "matchRate" | "gameRate">;

export type StatsEntryOpps = StatsEntryRates & {
  oppMatches: number[];
  oppGames: number[];
};

export type Stats = {
  [playerid: Player["id"]]: StatsEntry | Pick<StatsEntry, "eventids">;
  ranking: Player["id"][];
  noStats?: boolean;
};

export type StatsReturn = Stats | (Pick<Stats, "ranking"> & { noStats: true });

export type EventOpps = {
  playerid: Player["id"];
  eventid: Event["id"];
  oppids: Player["id"][];
};

export type OppData = {
  [playerid: EventOpps["playerid"]]: EventOpps["oppids"];
};

export type TeamRelations = Record<Team["id"], Player["id"][]> &
  Record<Player["id"], Team["id"][]>;

export type MatchupData = {
  id: Player["id"];
  opp: Player["id"];
  count: number;
};

export type TeamData = Record<Team["id"], Team["players"]>;

export type GenerateData = Pick<
  EventDetail,
  "team" | "playerspermatch" | "byes"
> & {
  teamData?: TeamData;
  oppData: OppData;
  allMatchups: MatchupData[];
};
