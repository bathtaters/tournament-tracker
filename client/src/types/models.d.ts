export type EventData = {
  id: string;
  title: string;
  /** ISO Format */
  day: string;
  status: number;
  players: string[];
  roundactive: number;
  wincount: number;
  playerspermatch: number;
  anyreported?: boolean;
  matches?: string[][];
  drops?: string[];
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

export type Stats = {
  matchRecord: [number, number, number];
  gameRate: number;
  oppMatch: number;
  oppGame: number;
};
