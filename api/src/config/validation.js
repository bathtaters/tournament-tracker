// Define Shared Vars
const sharedLimits = {
  title:  { min: 1, max: 50 },
  player: { min: 0, max: 32 },
  rounds: { min: 1, max: 20 },
  wins:   { min: 0, max: 10 },
  dates:  { min: 0, max: 30 },
  slots:  { min: 0, max: 10 },
};

sharedLimits.activeRounds = { 
  min: sharedLimits.rounds.min - 1,
  max: sharedLimits.rounds.max + 1,
};

sharedLimits.wincount = { min: 1, max: sharedLimits.wins.max };

const today = (new Date()).toISOString().slice(0,10);
const tomorrow = (new Date(Date.now() + (24*60*60*1000))).toISOString().slice(0,10);


// Validation Config Vars
module.exports = {
  defaults: {
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
    },
    player: {
      name: "New Player",
      password: null,
      credits: 0,
      access: 1,
      isteam: false,
      members: null,
      session: null,
    },
    event: {
      title: "New Game",
      day: null,
      slot: 0,
      plan: false,
      players: [],
      playercount: 8,
      roundactive: 0,
      roundcount: 3,
      wincount: 2,
      playerspermatch: 2,
      notes: '',
      link: '',
      clocklimit: '01:00:00',
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
    voter: {
      days: [],
      events: [],
    },
  },

  limits: {
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
      members: { min: 2, max: 12 },
    },
    event: {
      title: sharedLimits.title,
      players: sharedLimits.player,
      playercount: sharedLimits.player,
      slot: sharedLimits.slots,
      roundactive: sharedLimits.activeRounds,
      roundcount: sharedLimits.rounds,
      wincount: sharedLimits.wincount,
      playerspermatch: { min: 1, max: 4 },
      notes: { min: 0, max: 256 },
      clocklimit: {min: '00:01', max: '24:00:00'},
    },
    match: {
      round:   sharedLimits.rounds,
      players: sharedLimits.player,
      wins:    { array: sharedLimits.player, elem: sharedLimits.wins, },
      draws:   sharedLimits.wins,
      drops:   sharedLimits.player,
      setDrawsMax: 1,
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
    }
  },

  types: {
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
    },
    player: {
      id: "uuid",
      name: "string",
      password: "string?",
      credits: "float",
      access: "int",
      session: "uuid?",
      isteam: "boolean",
      members: "uuid[]?",
    },
    event: {
      id: "uuid",
      title: "string",
      day: "date?",
      slot: "int",
      plan: "boolean",
      players: "uuid[]",
      playercount: "int",
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
      playerid: "uuid"
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
    }
  }
};