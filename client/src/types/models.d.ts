import { enums } from "assets/validation";

export type EventFormat = keyof typeof enums.EventFormat;
export type TeamType = keyof typeof enums.TeamType | null;

export type EventData = {
  id: string;
  title: string;
  /** ISO Format */
  day: string;
  format: EventFormat;
  team: TeamType;
  status: number;
  players: string[];
  roundactive: number;
  wincount: number;
  playerspermatch: number;
  teamsize: number;
  anyreported?: boolean;
  matches?: string[][];
  drops?: string[];
  isteam?: boolean;
};

export type Player = {
  id: string;
  name: string;
  credits?: number;
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
  isDraw: boolean;
};

export type MatchReport = Pick<
  MatchData,
  "id" | "eventid" | "wins" | "draws" | "drops" | "reported"
>;

export type PlayerRecord = [win: number, loss: number, draw: number];

export type Stats = {
  matchRecord: [number, number, number];
  gameRate: number;
  oppMatch: number;
  oppGame: number;
};
