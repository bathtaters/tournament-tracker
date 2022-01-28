// Models
const event = require('../db/models/event');
const match = require('../db/models/match');
const player = require('../db/models/player');
const setting = require('../db/models/settings');

// Imports
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
  const settingsData = await setting.get(req.param.setting);
  if (!settingsData) throw new Error(req.param.setting + ' setting not found.');
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
  if (!req.body) return res.sendAndLog({ success: false });
  
  const settingsArray = toObjArray(req.body);

  const set = await setting.batchSet(settingsArray).then(r => r && r.map(s => s.id));
  return res.sendAndLog({ success: true, set });
}

// Schedule data
const getSchedule = async function(_, res) {
  const schedule = await event.getSchedule().then(sortSlots).then(arrToObj('day'));
  
  return res.sendAndLog(schedule);
}



// RESET TO DEMO DB (Dev only)
const ops = require('../db/admin/interface');
const sqlFolder = require('../config/meta').sqlFilesPath;
const dbResetFile = require('path').join(sqlFolder,'resetDb.sql');
const dbTestFile = require('path').join(sqlFolder,'dbtest.sql');
const resetDB = full => (_, res) => ops.file(full && dbResetFile, dbTestFile)
  .then(() => res.sendAndLog({ reset: true, full }));



module.exports = { getAll, getSetting, getSettings, setSettings, getSchedule, resetDB, };



// HELPER - Sort schedule to daily slots, appending unslotted to the end
function sortSlots(schedArray) {
  return schedArray.map(entry => {
    entry.events = []; entry.slots = [];
    
    for (const [event,slot] of Object.entries(entry.eventslots)) {
      if (slot && !entry.slots[slot - 1]) entry.slots[slot - 1] = event;
      else entry.events.push(event);
    }
    
    delete entry.eventslots;
    return entry;
  });
}