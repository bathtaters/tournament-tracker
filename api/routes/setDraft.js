` *** Public API commands ***

 -- LEGEND --
 draftId = UUID for draft entry
 matchId = UUID for match entry
 playerId = UUID for player entry

 -- Edit Drafts --
PUT: ./set/draft { ...draftData }
Returns: Create new draft

DELETE: ./set/draft/<draftId>
Returns: Delete draft

POST: ./set/draft/<draftId> { ...draftData }
Returns: Update draft data

// POST: ./set/draft/<draftId> { day: Date() }
// Returns: Update draft date

PUT: ./set/draft/<draftId>/round
Returns: Create a new round

DELETE: ./set/draft/<draftId>/round
Returns: Remove last round

POST: ./set/draft/<matchId>/report { ...reportData }
Returns: Report wins/losses/etc for match

POST: ./set/draft/<matchId>/unreport
Returns: Clear report wins/losses/etc for match

DELETE: ./set/draft/<draftId>/player/<playerId>
Returns: Drop player from draft

PUT: ./set/draft/<draftId>/player/<playerId>
Returns: Undrop player from draft
`

// Init
const router = require('express').Router();
const logger = console;

// DB
const draft = require('../db/draft');
const match = require('../db/match');
const results = require('../db/results');

/* SET draft database. */

// Create draft
router.put('/', (req, res) => draft.add(req.body).then(res.send));
router.delete('/:id', (req, res) => draft.rmv(req.params.id).then(res.send));

// // Schedule draft
// router.post('/:id/schedule', (req, res) =>
//   req.body.day && !req.body.day.getTime ?
//   res.send({error: 'Invalid date: '+req.body.day}) :
//   draft.set(req.params.id, req.body.day)
// );

// Next round
router.put('/:id/round', (req, res) => match.pushRound(req.params.id).then(res.send));
router.delete('/:id/round', (req, res) => match.popRound(req.params.id).then(res.send));

// Report match
router.post('/:match/report', (req, res) => results.report(req.params.match, req.body).then(res.send));
router.post('/:match/unreport', (req, res) => results.unreport(req.params.match).then(res.send));

// Drop player
router.delete('/:id/player/:player', (req, res) => draft.dropPlayer(req.params.id, req.params.player).then(res.send));
router.put('/:id/player/:player', (req, res) => draft.addPlayer(req.params.id, req.params.player).then(res.send));

// Manually set draft data
router.post('/:id', (req, res) => draft.set(req.params.id, req.body).then(res.send));

module.exports = router;