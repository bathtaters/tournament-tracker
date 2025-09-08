export type Settings = {
  id: string;
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

export type Player = {
  id: string; // uuid
  name: string;
  password?: string;
  credits: number;
  access: number;
  session?: string;
  hide: boolean;
};

export type Event = {
  id: string; // uuid
  title: string;
  day?: Date | null;
  slot: number;
  plan: number;
  format: string;
  team?: string;
  players: string[]; // uuid[]
  playercount: number;
  teamsize: number;
  roundactive: number;
  roundcount: number;
  wincount: number;
  playerspermatch: number;
  notes: string;
  link: string;
  clocklimit: string; // interval
  clockstart?: Date;
  clockmod?: string; // interval
};

export type EventDetail = {
  id: string; // uuid
  title: string;
  day?: Date;
  slot: number;
  format: string;
  team?: string;
  players: string[]; // uuid[]
  playercount: number;
  teamsize: number;
  roundactive: number;
  roundcount: number;
  wincount: number;
  playerspermatch: number;
  notes: string;
  link: string;
  allreported: boolean;
  anyreported: boolean;
  byes: string[]; // uuid[]
  drops: string[]; // uuid[] (Returned from DB as uuid[][])
  clocklimit: string; // interval
};

export type Match = {
  id: string; // uuid
  eventid: string; // uuid
  round: number;
  players: string[]; // uuid[]
  wins: number[];
  draws: number;
  drops?: string[]; // uuid[]
  reported: boolean;
  undrop: boolean;
  playerid: string; // uuid
};

export type Team = {
  id: string; // uuid
  name?: string | null;
  players: string[]; // uuid[]
};

export type Voter = {
  id: string; // uuid
  days: Date[];
  events: string[]; // uuid[]
};

export type SwapItem = {
  id: string; // uuid
  playerid: string; // uuid
};

export type Swap = {
  swap: SwapItem[];
};

export type Plan = {
  voters: string[]; // uuid[]
  events: string[]; // uuid[]
};

export type EventDay = {
  day: string;
  eventslots: Record<string, number>;
};

export type EventOpps = {
  playerid: string; // uuid
  eventid: string; // uuid
  oppids: string[]; // uuid[]
};
