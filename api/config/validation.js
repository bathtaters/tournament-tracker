// Define Shared Vars
const sharedLimits = {
  title: { min: 1, max: 50 },
  player: { min: 0, max: 32 },
  rounds: { min: 1, max: 20 },
};

const activeRoundLimit = { 
  min: sharedLimits.rounds.min - 1,
  max: sharedLimits.rounds.max + 1,
};

const today = (new Date()).toISOString().slice(0,10);
const tomorrow = (new Date(Date.now() + (24*60*60*1000))).toISOString().slice(0,10);


// Validation Config Vars
const validateConfig = {
  defaults: {
    settings: {
      title: "Tournament Tracker",
      showadvanced: false,
      showrawjson: false,
      datestart: today,
      dateend: tomorrow,
    },
    player: {
      name: "New Player",
      isteam: false,
      members: null,
    },
    draft: {
      title: "New Game",
      day: null,
      players: [],
      roundactive: 0,
      roundcount: 3,
      bestof: 3,
      playerspermatch: 3,
      clocklimit: '60 mins',
      clockstart: null,
      clockmod: null,
    },
    match: {
      round: 1,
      players: {},
      draws: 0,
      drops: [],
      reported: false,
    },
  },

  limits: {
    settings: {
      title: sharedLimits.title,
      daterange: { min: 1, max: 30 },
    },
    player: {
      name: sharedLimits.title,
      members: { min: 2, max: 12 },
    },
    draft: {
      title: sharedLimits.title,
      players: sharedLimits.player,
      roundactive: activeRoundLimit,
      roundcount: sharedLimits.rounds,
      bestof: { min: 1, max: 11 },
      playerspermatch: { min: 1, max: 4 },
    },
    match: {
      round:   sharedLimits.rounds,
      players: sharedLimits.player,
      draws:   { min: 1, max: 99 },
      drops:   sharedLimits.player,
    }
  },

  types: {
    settings: {
      title: "string",
      showadvanced: "boolean",
      showrawjson: "boolean",
      datestart: "string",
      dateend: "string"
    },
    player: {
      id: "uuid",
      name: "string",
      isteam: "boolean",
      members: "array:uuid?"
    },
    draft: {
      id: "uuid",
      title: "string",
      day: "date?",
      players: "array:uuid",
      roundactive: "int",
      roundcount: "int",
      bestof: "int",
      playerspermatch: "int",
      clocklimit: "interval",
      clockstart: "date?",
      clockmod: "interval?"
    },
    match: {
      id: "uuid",
      draftid: "uuid",
      round: "int",
      players: "object:uuid=int",
      draws: "int",
      drops: "array:uuid",
      reported: "boolean"
    }
  }
};

// Save JSON of validation to client assets
const join = require('path').join;
const fs = require('fs/promises');
const projectDir = join(__dirname,'..','..');
const defaultClientPath = join(projectDir,'client','src','assets','validation.json')
const exportToClient = (path = defaultClientPath) => fs.writeFile(path, JSON.stringify(valConfig));

module.exports = { config: validateConfig, exportToClient }