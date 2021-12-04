` *** Public API commands ***

 -- LEGEND --
 draftId = UUID for draft entry
 matchId = UUID for match entry
 playerId = UUID for player entry

 -- Get Drafts --
GET: ./draft/all
GET: ./draft/<draftId>
Returns: data from all/a drafts

GET: ./draft/<draftId>/breakers
Returns: breakers from draft

 -- Edit Drafts --
POST: ./draft { ...draftData }
Returns: Create new draft

DELETE: ./draft/<draftId>
Returns: Delete draft

PATCH: ./draft/<draftId> { ...draftData }
Returns: Update draft data

POST: ./draft/<draftId>/round
Returns: Create a new round

DELETE: ./draft/<draftId>/round
Returns: Remove last round

PATCH: ./draft/<matchId>/report { ...reportData }
Returns: Report wins/losses/etc for match

PATCH: ./draft/<matchId>/unreport
Returns: Clear report wins/losses/etc for match

DELETE: ./draft/<draftId>/player/<playerId>
Returns: Drop player from draft

PUT: ./draft/<draftId>/player/<playerId>
Returns: Undrop player from draft
`

// Init
const router = require('express').Router();
const logger = console;
const { arrToObj, sortById } = require('../services/utils');

// DB
const draft = require('../db/draft');
const match = require('../db/match');
const results = require('../db/results');

/* GET draft database. */

// All drafts
router.get('/all', async function(req, res) {
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

  res.sendAndLog(drafts);
});

// Specific draft
router.get('/:id', async function(req, res) {
  const [draftData, allPlayers, matches] = await Promise.all([
    draft.get(req.params.id),
    draft.getPlayers(req.params.id),
    match.listDetail(req.params.id),
  ]);

  if (!draftData) return res.sendAndLog({ err: 'Draft does not exist: '+ req.params.id});
  
  draftData.matches = [];
  if (allPlayers) draftData.allPlayers = allPlayers.players;
  if (matches && matches.length) {
    matches.sort(sortById);
    matches.forEach(m => {
      if (!m.draftid || !m.round) return logger.error('Match is missing ID/round',m);
      if (draftData.id !== m.draftid) return logger.error('Match does not match draftId', draftData.id, m);
      if (draftData.matches[m.round - 1]) draftData.matches[m.round - 1].push(m);
      else draftData.matches[m.round - 1] = [m];
      delete m.draftid;
      delete m.round;
    });
  }
  else if (!draftData.allPlayers || !draftData.allPlayers.length) draftData.allPlayers = draftData.players

  res.sendAndLog(draftData);
});

// Breakers from draft
router.get('/:id/breakers', async function(req, res) {
  const breakers = await results.getBreakers(req.params.id);
  res.sendAndLog(breakers);
});


/* SET draft database. */

// Create draft
router.post('/', (req, res) => draft.add(req.body).then(res.sendAndLog));
router.delete('/:id', (req, res) => draft.rmv(req.params.id).then(res.sendAndLog));

// Manually set draft data
router.patch('/:id', (req, res) => draft.set(req.params.id, req.body).then(res.sendAndLog));

// Generate round
router.post('/:id/round', (req, res) => match.pushRound(req.params.id).then(res.sendAndLog));
router.delete('/:id/round', (req, res) => match.popRound(req.params.id).then(res.sendAndLog));

// Drop player
router.post('/:id/drop/:player', (req, res) => draft.dropPlayer(req.params.id, req.params.player).then(res.sendAndLog));
router.post('/:id/undrop/:player', (req, res) => draft.addPlayer(req.params.id, req.params.player).then(res.sendAndLog));

module.exports = router;