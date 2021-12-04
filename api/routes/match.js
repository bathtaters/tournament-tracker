` *** Public API commands ***

 -- LEGEND --
draftId = UUID for draft entry
matchId = UUID for match entry
playerId = UUID for player entry

 -- Get Matches --
TBD

 -- Edit Matches --
POST: ./match/<matchId> { ...reportData }
Returns: Report wins/losses/etc for match => { [draft]id }

DELETE: ./match/<matchId>
Returns: Clear report wins/losses/etc for match => { [draft]id }

PATCH: ./match/swap [ { id: <playerId>, match: <matchId> }, ... ]
Returns: Swap two players w/in matches => { [draft]id }
`

// Init
const router = require('express').Router();
const logger = console;

// DB
const matches = require('../db/match');
const results = require('../db/results');
const players = require('../db/player');


/* GET match database. */



/* SET match database. */

// Report match
router.post('/:id', (req, res) => results.report(req.params.id, req.body).then(res.sendAndLog));
router.delete('/:id', (req, res) => results.unreport(req.params.id).then(res.sendAndLog));
router.patch('/:id', (req, res) => matches.update(req.params.id, req.body).then(res.sendAndLog));

// Swap players
router.patch('/swap', (req, res) => players.swap(
  req.body.playerA.playerId,
  req.body.playerA.id,
  req.body.playerB.playerId,
  req.body.playerB.id
).then(res.sendAndLog));

module.exports = router;