import type {
  Event,
  EventDetail,
  MatchupData,
  OppData,
  Player,
  Stats,
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

export type Stats = {
  [playerid: Player["id"]]: StatsEntry;
  ranking: Player["id"][];
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

export type MatchupData = {
  id: Player["id"];
  opp: Player["id"];
  count: number;
};

type GenerateData = Pick<EventDetail, "playerspermatch" | "byes"> & {
  oppData: OppData;
  allMatchups: MatchupData[];
};
