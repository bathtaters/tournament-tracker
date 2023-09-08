const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const match = require('../db/models/match');
const player = require('../db/models/player');
const setting = require('../db/models/settings');

// Imports
const { resetDatabase } = require('../services/db.services');
const { asType, toObjArray } = require('../services/settings.services');
const { arrToObj } = require('../utils/shared.utils');
const logger = require('../utils/log.adapter');

/* GET page data. */

// All data
async function getAll(_, res) {
  const settings = await setting.getAll();
  const schedule = await event.getSchedule().then(arrToObj('day'));
  const events = await event.get().then(arrToObj('id'));
  const players = await player.get().then(arrToObj('id'));
  const matches = await match.listByEvent();
  matches.forEach(d => {
    if (!events[d]) return logger.error('Match is missing event', d);
    events[d].matches = matches[d];
  });

  return res.sendAndLog({ settings, schedule, events, players });
}

// Settings
async function getSetting(req,res) {
  const { setting } = matchedData(req);
  const settingsData = await setting.get(setting);
  if (!settingsData) throw new Error(setting + ' setting not found.');
  return res.sendAndLog(asType(settingsData));
}

async function getSettings(req,res) {
  const settingsData = await setting.getAll();
  if (!Array.isArray(settingsData)) throw new Error('Settings not found.');
  
  let settings = {};
  settingsData.forEach(entry => settings[entry.id] = asType(entry));
  return res.sendAndLog(settings);
}

async function setSettings(req,res) {
  const settings = matchedData(req);
  if (!Object.keys(settings).length) return res.sendAndLog({ success: false });
  
  const settingsArray = toObjArray(settings);

  const set = await setting.batchSet(settingsArray).then(r => r && r.map(s => s.id));
  return res.sendAndLog({ success: true, set });
}

// Schedule data
const getSchedule = (planOnly) => async function(_, res) {
  const [schedule, settingsData] = await Promise.all([
    event.getSchedule(planOnly).then(arrToObj('day')),
    setting.get(['dayslots','datestart','dateend','planslots','plandates','showplan']),
  ]);

  let settings = {};
  settingsData.forEach((entry) => settings[entry.id] = asType(entry));
  return res.sendAndLog({ schedule, settings });
}


// RESET DB
const resetDB = full => (_, res) => resetDatabase(full, true)
  .then((r) => res.sendAndLog({ reset: Boolean(r & 1), full: Boolean(r & 2) }));



module.exports = { getAll, getSetting, getSettings, setSettings, getSchedule, resetDB, };