// Models
const draft = require('../db/models/draft');
const match = require('../db/models/match');
const player = require('../db/models/player');
const setting = require('../db/models/settings');

// Imports
const { asType, toObjArray } = require('../services/settings');
const { arrToObj } = require('../utils/utils');
const logger = console;

/* GET page data. */

// All data
async function getAll(_, res) {
  const settings = await setting.getAll();
  const schedule = await draft.getSchedule().then(arrToObj('day'));
  const drafts = await draft.get().then(arrToObj('id'));
  const players = await player.get().then(arrToObj('id'));
  const matches = await match.listByDraft();
  matches.forEach(d => {
    if (!drafts[d]) return logger.error('Match is missing draft', d);
    drafts[d].matches = matches[d];
  });

  return res.sendAndLog({ settings, schedule, drafts, players });
}

// Settings
async function getSettings(req,res) {
  const settingsData = await setting.getAll();
  if (!Array.isArray(settingsData)) throw new Error('Settings not found.');
  
  let settings = {};
  settingsData.forEach(entry => settings[entry.id] = asType(entry));
  return res.sendAndLog(settings);
}

async function setSettings(req,res) {
  if (!req.body) return res.sendAndLog({ success: false });
  
  const settingsArray = toObjArray(req.body);

  await setting.batchSet(settingsArray);
  return res.sendAndLog({ success: true });
}

// Schedule data
const getSchedule = async function(_, res) {
  const schedule = await draft.getSchedule().then(arrToObj('day'));
  return res.sendAndLog(schedule);
}



// RESET TO DEMO DB (Dev only)
const ops = require('../db/admin/interface');
const sqlFolder = require('../config/meta').sqlFilesPath;
const { settings } = require('../db/sql/strings');
const dbResetFile = require('path').join(sqlFolder,'resetDb.sql');
const dbTestFile = require('path').join(sqlFolder,'dbtest.sql');
const resetDB = full => (_, res) => ops.file(full && dbResetFile, dbTestFile)
  .then(() => res.sendAndLog({ reset: true, full }));



module.exports = { getAll, getSettings, setSettings, getSchedule, resetDB, };