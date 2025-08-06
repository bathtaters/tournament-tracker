import { customInterval } from "../utils/validate.utils";
const interval = customInterval.sanitize.options;

// Common values
const MAX_WINS = 10,
  MAX_ROUNDS = 20;

const sharedLimits = {
  title: { min: 1, max: 50 },
  player: { min: 0, max: 32 },
  rounds: { min: 1, max: 20 },
  wins: { min: 0, max: MAX_WINS },
  wincount: { min: 1, max: MAX_WINS },
  dates: { min: 0, max: 30 },
  slots: { min: 0, max: 10 },
  activeRounds: { min: 0, max: MAX_ROUNDS + 1 },
};

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

// ---------- TYPES ---------- //
export const types = {
  settings: {
    setting: "string",
    title: "string",
    showrawjson: "boolean",
    autofillsize: "int",
    autobyes: "boolean",
    dayslots: "int",
    datestart: "date",
    dateend: "date",
    planstatus: "int",
    plandates: "date[]",
    planslots: "int",
    planmenu: "boolean",
    planschedule: "boolean",
    showcredits: "boolean",
    showstandings: "boolean",
  },
  player: {
    id: "uuid",
    name: "string",
    password: "string?",
    credits: "float",
    access: "int",
    session: "string?",
    isteam: "boolean",
    members: "uuid[]?",
    hide: "boolean",
  },
  event: {
    id: "uuid",
    title: "string",
    day: "date?",
    slot: "int",
    plan: "int",
    format: "string",
    team: "string",
    players: "uuid[]",
    playercount: "int",
    teamsize: "int",
    roundactive: "int",
    roundcount: "int",
    wincount: "int",
    playerspermatch: "int",
    notes: "string*",
    link: "string*",
    clocklimit: "interval",
    clockstart: "datetime?",
    clockmod: "interval?",
  },
  match: {
    id: "uuid",
    eventid: "uuid",
    round: "int",
    players: "uuid[]",
    wins: "int[]",
    draws: "int",
    drops: "uuid[]?",
    reported: "boolean",
    undrop: "boolean",
    playerid: "uuid",
  },
  team: {
    id: "uuid",
    name: "string?",
    players: "uuid[]",
  },
  voter: {
    id: "uuid",
    days: "date[]",
    events: "uuid[?]",
  },
  swap: {
    swap: "object[]",
    "swap.*.id": "uuid",
    "swap.*.playerid": "uuid",
  },
  plan: {
    voters: "uuid[]",
    events: "uuid[]",
  },
} as const;

// ---------- DEFAULTS ---------- //
export const defaults = {
  settings: {
    title: "Tournament Tracker",
    showrawjson: false,
    dayslots: 2,
    autofillsize: 8,
    datestart: today,
    dateend: tomorrow,
    autobyes: true,
    planstatus: 1,
    plandates: [],
    planslots: 2,
    planmenu: false,
    planschedule: false,
    showcredits: false,
    showstandings: false,
  },
  player: {
    name: "New Player",
    password: null,
    credits: 0,
    access: 1,
    session: null,
    hide: false,
  },
  event: {
    title: "New Game",
    day: null,
    slot: 0,
    plan: 0,
    format: "swiss",
    team: "solo",
    players: [],
    playercount: 8,
    teamsize: 1,
    roundactive: 0,
    roundcount: 3,
    wincount: 2,
    playerspermatch: 2,
    notes: "",
    link: "",
    clocklimit: interval({ minutes: 50 }),
    clockstart: null,
    clockmod: null,
  },
  match: {
    round: 1,
    players: [],
    wins: [],
    draws: 0,
    drops: [],
    reported: false,
    undrop: false,
  },
  team: {},
  voter: {
    days: [],
    events: [],
  },
  swap: {},
  plan: {},
} as const;

// ---------- LIMITS ---------- //
export const limits = {
  settings: {
    title: sharedLimits.title,
    daterange: { min: 1, max: sharedLimits.dates.max },
    dayslots: sharedLimits.slots,
    autofillsize: sharedLimits.player,
    planstatus: { min: 0, max: 4 },
    plandates: sharedLimits.dates,
    planslots: sharedLimits.slots,
  },
  player: {
    name: sharedLimits.title,
    credits: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
    password: { min: 6, max: 64 },
    access: { min: 0, max: 3 },
    session: { min: 32, max: 36 },
  },
  event: {
    title: sharedLimits.title,
    players: sharedLimits.player,
    playercount: sharedLimits.player,
    teamsize: { min: 1, max: sharedLimits.player.max },
    slot: sharedLimits.slots,
    roundactive: sharedLimits.activeRounds,
    roundcount: sharedLimits.rounds,
    wincount: sharedLimits.wincount,
    playerspermatch: { min: 1, max: 4 },
    notes: { min: 0, max: 256 },
  },
  match: {
    round: sharedLimits.rounds,
    players: sharedLimits.player,
    wins: { array: sharedLimits.player, elem: sharedLimits.wins },
    draws: sharedLimits.wins,
    drops: sharedLimits.player,
    setDrawsMax: 1,
  },
  team: {
    name: sharedLimits.title,
    players: sharedLimits.player,
  },
  voter: {
    days: sharedLimits.dates,
    events: { min: 0, max: 50 },
  },
  swap: {
    swap: { min: 2, max: 2 },
  },
  plan: {
    voters: { min: 0, max: 100 },
    events: { min: 0, max: 100 },
  },
} as const;
