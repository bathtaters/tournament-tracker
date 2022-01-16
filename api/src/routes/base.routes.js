` *** Public API commands ***

 -- LEGEND --
draftId = UUID for draft entry
playerId = UUID for player entry

 -- Get Page --
GET: ./all
Returns: all data from db

GET: ./schedule
Returns: schedule data
`

// Init
const router = require('express').Router();
const logger = console;
const { arrToObj } = require('../utils/utils');

// DB
const draft = require('../db/models/draft');
const match = require('../db/models/match');
const player = require('../db/models/player');
const settings = require('../db/models/settings');

/* GET page data. */

// All data
router.get('/all', async function(req, res) {
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
});

// Base settings
router.get('/settings', (req,res) => settings.getAll().then(res.sendAndLog));
router.patch('/settings', (req,res) => {
  if (req.body) settings.batchSet(req.body);
  return res.sendAndLog({ success: !!req.body });
});

// Schedule data
router.get('/schedule', async function(req, res) {
  const schedule = await draft.getSchedule().then(arrToObj('day'));
  res.sendAndLog(schedule);
});



// TEST BACKEND & RESET TO DEMO DB (Temp)
router.get('/test_backend', (req, res) => res.sendAndLog({result: 'Connected to internal API server.'}));

const ops = require('../db/admin/interface');
const dbResetFile = require('path').join(__dirname,'..','db','admin','resetDb.sql');
const dbTestFile = require('path').join(__dirname,'..','testing','dbtest.sql');
router.post('/reset/full', async function(req, res) {
    await ops.file(dbResetFile,dbTestFile);
    res.sendAndLog({reset: true});
});
router.post('/reset', async function(req, res) {
  await ops.file(dbTestFile);
  res.sendAndLog({reset: true});
});

module.exports = router;