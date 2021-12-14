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
  const matches = await match.list();
  Object.keys(matches).forEach(d => {
    if (!drafts[d]) return logger.error('Match is missing draft',d);
    drafts[d].matches = matches[d];
  });

  res.sendAndLog(drafts);
});

// Specific draft
router.get('/:id', async function(req, res) {
  const draftData = await draft.getDetail(req.params.id);

  if (!draftData) return res.sendAndLog({ err: 'Draft does not exist: '+ req.params.id});

  const [drops, matches] = await Promise.all([
    draft.getDrops(req.params.id),
    match.list(req.params.id),
  ]);

  res.sendAndLog({ ...draftData, matches, drops });
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
router.post(  '/:id/round', (req, res) => draft.pushRound(req.params.id).then(res.sendAndLog));
router.delete('/:id/round', (req, res) => draft.popRound(req.params.id).then(res.sendAndLog));

module.exports = router;