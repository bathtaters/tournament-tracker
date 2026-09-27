import type { Interval } from "./base";
import type { FlattenDates } from "./helpers";
import { enums } from "assets/validation";

export type Settings = FlattenDates<{
  title: string;
  showrawjson: boolean;
  autofillsize: number;
  autobyes: boolean;
  dayslots: number;
  datestart: Date;
  dateend: Date;
  planstatus: number;
  plandates: Date[];
  planslots: number;
  planprogress?: number;
  planerror?: string | null;
  planmenu: boolean;
  planschedule: boolean;
  showcredits: boolean;
  showstandings: boolean;
}>;

export type EventFormat = keyof typeof enums.EventFormat;
export type TeamType = keyof typeof enums.TeamType | null;

export type EventClock = {
  id: string;
  clocklimit?: Interval;
  clockstart?: Date;
  clockmod?: Interval;
};

export type EventData = EventClock & {
  title: string;
  /** ISO Format */
  day: string;
  slot: number;
  format: EventFormat;
  team: TeamType;
  status?: number;
  players: string[];
  playercount: number;
  teamsize: number;
  roundactive: number;
  roundcount?: number;
  wincount: number;
  playerspermatch: number;
  notes: string;
  link: string;
  allreported?: boolean;
  anyreported?: boolean;
  matches?: string[][];
  byes?: string[];
  drops?: string[];
  isteam?: boolean;
  /** Position in the plan queue, or false once unplanned */
  plan?: number | false;
};

export type EventDay = {
  day: string;
  eventslots: Record<EventData["id"], number>;
};

export type Schedule = {
  day: EventDay["day"];
  events: EventData["id"][];
};

export type Player = {
  id: string;
  name: string;
  access?: number;
  credits?: number;
  hide?: boolean;
};

export type Team = {
  id: string;
  name?: string;
  players: Player["id"][];
};

export type Match = {
  id: string;
  eventid: string;
  record: string[];
  isDrop?: boolean;
};

export type MatchData = {
  id: string;
  eventid: string;
  round: number;
  players: string[];
  wins: number[];
  draws: number;
  drops?: string[];
  reported: boolean;
  maxwins: number;
  totalwins: number;
  isDraw?: boolean;
  teamid?: string;
};

export type PlayerEventData = {
  record: PlayerRecord;
  isDrop: boolean;
};

export type MatchReport = Pick<MatchData, "id" | "eventid"> &
  Partial<Pick<MatchData, "wins" | "draws" | "drops" | "reported">> & {
    clear?: boolean;
  };

export type PlayerRecord = [win: number, loss: number, draw: number];

type StatsEntry = {
  eventids: EventData["id"][];
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
  noStats?: boolean;
};

export type Voter = {
  id: string;
  idx: number;
  /** ISO Format */
  days: string[];
  events: EventData["id"][];
};

export type Plan = {
  voters: Voter["id"][];
  events: EventData["id"][];
};
