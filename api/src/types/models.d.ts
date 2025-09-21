import type {
  EventFormat,
  LogAction,
  Settings,
  SettingsType,
  TeamType,
} from "./base";

export type LogEntry = {
  id: string; // uuid
  dbtable: string;
  tableid?: string;
  action: LogAction;
  data?: any;
  userid?: string; // uuid
  sessionid?: string;
  error?: string;
  ts: Date;
};
export type LogEntryAdd = Omit<LogEntry, "id" | "ts"> &
  Partial<Pick<LogEntry, "id" | "ts">>;

export type SettingsEntry = {
  id: keyof Settings;
  value?: string | null;
  type: SettingsType;
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
  format: EventFormat;
  team?: TeamType;
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
  day: Date | null;
  slot: number;
  format: EventFormat;
  team: TeamType | null;
  players: string[]; // uuid[]
  playercount: number;
  teamsize: number;
  roundactive: number;
  roundcount: number;
  wincount: number;
  playerspermatch: number;
  notes: string;
  link: string;
  allreported: boolean | null;
  anyreported: boolean | null;
  byes: string[] | null; // uuid[]
  drops: string[] | null; // uuid[] (Returned from DB as uuid[][])
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

export type MatchDetail = {
  id: string; // uuid
  eventid: string; // uuid
  round: number;
  players: string[]; // uuid[]
  wins: number[];
  draws: number;
  drops?: string[]; // uuid[]
  reported: boolean;
  maxwins: number;
  totalwins: number;
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

export type Plan = {
  voters: string[]; // uuid[]
  events: string[]; // uuid[]
};

export type EventDay = {
  day: string;
  eventslots: Record<string, number>;
};
