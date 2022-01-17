const draft = require('../db/models/draft');
const match = require('../db/models/match');
const player = require('../db/models/player');
const settings = require('../db/models/settings');

const logger = console;
const { arrToObj } = require('../utils/utils');

/* GET page data. */

// All data
async function getAll(_, res) {
  const schedule = await draft.getByDay().then(days => days && days.map(d => {
    d.day = d.day && d.day.getTime();
    return d;
  }));
  const drafts = await draft.list().then(arrToObj('id'));
  const players = await player.list().then(arrToObj('id'));
  const matches = await match.listDetail();
  matches.forEach(m => {
    if (!m.draftid || !m.round) return logger.error('Match is missing ID/round',m);
    if (!drafts[m.draftid].matches) drafts[m.draftid].matches = [];
    if (drafts[m.draftid].matches[m.round - 1]) drafts[m.draftid].matches[m.round - 1].push(m);
    else drafts[m.draftid].matches[m.round - 1] = [m];
    delete m.draftid;
    delete m.round;
  });

  res.sendAndLog({ settings, schedule, drafts, players });
}

// Base settings
const getSettings = (_,res) => settings.getAll().then(res.sendAndLog);
const setSettings = (req,res) => {
  if (req.body) settings.batchSet(req.body);
  return res.sendAndLog({ success: !!req.body });
}

// Schedule data
const getSchedule = async function(_, res) {
  const schedule = await draft.getSchedule().then(arrToObj('day'));
  res.sendAndLog(schedule);
}



// RESET TO DEMO DB (Dev only)
const ops = require('../db/admin/interface');
const sqlFolder = require('../config/meta').sqlFilesPath;
const dbResetFile = require('path').join(sqlFolder,'resetDb.sql');
const dbTestFile = require('path').join(sqlFolder,'dbtest.sql');
const resetDB = full => (_, res) => ops.file(full && dbResetFile, dbTestFile)
  .then(() => res.sendAndLog({ reset: true, full }));



module.exports = { getAll, getSettings, setSettings, getSchedule, resetDB, };