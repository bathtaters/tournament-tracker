` *** Public API commands ***

 -- LEGEND --
draftId = UUID for draft entry
playerId = UUID for player entry

 -- Get Page --
GET: ./get/all
Returns: all data from db

GET: ./get/schedule
Returns: schedule data

GET: ./get/drafts
GET: ./get/draft/<draftId>
Returns: data from one/all drafts

GET: ./get/breakers/<draftId>
Returns: breakers from draft

GET: ./get/players
GET: ./get/player/<playerId>
Returns: data from one/all players
`

// Init
const router = require('express').Router();
const logger = console;

// DB
const draft = require('../db/draft');
const match = require('../db/match');
const results = require('../db/results');
const player = require('../db/player');
let settings = require('../settings.json');
settings.dateRange = settings.dateRange.map(d => (new Date(d)).getTime());


const arrToObj = key => obj => obj && obj.reduce((o,e) => {
  if (e[key] && !o[e[key]]) o[e[key]] = e;
  else if (e[key]) logger.error('Entry has duplicate key:',key,e[key],e);
  else logger.error('Entry is missing key:',key,e);
  delete e[key];
  return o;
}, {});

/* GET page data. */
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

  res.send({ settings, schedule, drafts, players });
});

// Get Draft data
router.get('/drafts', async function(req, res) {
  const drafts = await draft.list().then(arrToObj('id'));
  const matches = await match.listDetail();
  matches.forEach(m => {
    if (!m.draftid || !m.round) return logger.error('Match is missing ID/round',m);
    if (!drafts[m.draftid].matches) drafts[m.draftid].matches = [];
    if (drafts[m.draftid].matches[m.round - 1]) drafts[m.draftid].matches[m.round - 1].push(m);
    else drafts[m.draftid].matches[m.round - 1] = [m];
    delete m.draftid;
    delete m.round;
  });

  res.send(drafts);
});

router.get('/draft/:id', async function(req, res) {
  const draftData = await draft.get(req.params.id);
  if (!draftData) return res.send({ err: 'Draft does not exist: '+ req.params.id});
  const matches = await match.listDetail(req.params.id);
  matches.forEach(m => {
    if (!m.draftid || !m.round) return logger.error('Match is missing ID/round',m);
    if (draftData.id !== m.draftid) return logger.error('Match does not match draftId', draftData.id, m);
    if (!draftData.matches) draftData.matches = [];
    if (draftData.matches[m.round - 1]) draftData.matches[m.round - 1].push(m);
    else draftData.matches[m.round - 1] = [m];
    delete m.draftid;
    delete m.round;
  });

  res.send(draftData);
});

router.get('/breakers/:id', async function(req, res) {
  const breakers = await results.getBreakers(req.params.id);
  res.send(breakers);
});

router.get('/schedule', async function(req, res) {
  const schedule = await draft.getByDay().then(days => days && days.map(d => {
    d.day = d.day && d.day.getTime();
    return d;
  }));
  res.send(schedule);
});

// Get Player data
router.get('/players', async function(req, res) {
  const players = await player.list().then(arrToObj('id'));
  res.send(players);
});

router.get('/player/:id', async function(req, res) {
  const playerData = await player.get(req.params.id);
  res.send(playerData);
});

module.exports = router;