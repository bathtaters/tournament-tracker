// Define Shared Vars
const sharedLimits = {
  title:  { min: 1, max: 50 },
  player: { min: 0, max: 32 },
  rounds: { min: 1, max: 20 },
  wins:   { min: 0, max: 10 },
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
      showadvanced: false,
      showrawjson: false,
      dayslots: 4,
      autofillsize: 8,
      datestart: today,
      dateend: tomorrow,
      autobyes: true,
      includeincomplete: false,
    },
    player: {
      name: "New Player",
      isteam: false,
      members: null,
    },
    event: {
      title: "New Game",
      day: null,
      slot: 0,
      players: [],
      roundactive: 0,
      roundcount: 3,
      wincount: 2,
      playerspermatch: 2,
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
  },

  limits: {
    settings: {
      title: sharedLimits.title,
      daterange: { min: 1, max: 30 },
      dayslots: { min: 0, max: 10 },
      autofillsize: sharedLimits.player,
    },
    player: {
      name: sharedLimits.title,
      members: { min: 2, max: 12 },
    },
    event: {
      title: sharedLimits.title,
      players: sharedLimits.player,
      roundactive: sharedLimits.activeRounds,
      roundcount: sharedLimits.rounds,
      wincount: sharedLimits.wincount,
      playerspermatch: { min: 1, max: 4 },
      clocklimit: {min: '00:01', max: '24:00:00'}
    },
    match: {
      round:   sharedLimits.rounds,
      players: sharedLimits.player,
      wins:    { array: sharedLimits.player, elem: sharedLimits.wins, },
      draws:   sharedLimits.wins,
      drops:   sharedLimits.player,
      setDrawsMax: 1,
    },
    swap: {
      swap: { min: 2, max: 2 },
    },
  },

  types: {
    settings: {
      setting: "string",
      title: "string",
      showadvanced: "boolean",
      showrawjson: "boolean",
      autofillsize: "int",
      autobyes: "boolean",
      dayslots: "int",
      datestart: "date",
      dateend: "date"
    },
    player: {
      id: "uuid",
      name: "string",
      isteam: "boolean",
      members: "uuid[]?"
    },
    event: {
      id: "uuid",
      title: "string",
      day: "date?",
      players: "uuid[]",
      roundactive: "int",
      roundcount: "int",
      wincount: "int",
      playerspermatch: "int",
      clocklimit: "interval",
      clockstart: "datetime?",
      clockmod: "interval?"
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
      undrop: "boolean"
    },
    swap: {
      swap: "object[]",
      "swap.*.id": "uuid",
      "swap.*.playerid": "uuid",
    }
  }
};