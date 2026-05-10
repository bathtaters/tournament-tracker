import { enums } from "assets/validation";

export type Settings = {
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
  planmenu: boolean;
  planschedule: boolean;
  showcredits: boolean;
  showstandings: boolean;
};

export type EventFormat = keyof typeof enums.EventFormat;
export type TeamType = keyof typeof enums.TeamType | null;

export type EventData = {
  id: string;
  title: string;
  /** ISO Format */
  day: string;
  format: EventFormat;
  team: TeamType;
  status?: number;
  players: string[];
  roundactive: number;
  roundcount?: number;
  wincount: number;
  playerspermatch: number;
  teamsize: number;
  anyreported?: boolean;
  matches?: string[][];
  drops?: string[];
  isteam?: boolean;
};

export type Schedule = {
  day: string;
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
  matchRecord: [number, number, number];
  gameRate: number;
  oppMatch: number;
  oppGame: number;
};

export type Stats = Record<Player["id"], StatsEntry> & {
  ranking: Player["id"][];
};
