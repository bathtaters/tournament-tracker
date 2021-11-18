` *** Public API commands ***

 -- LEGEND --
draftId = UUID for draft entry
matchId = UUID for match entry
playerId = UUID for player entry

 -- Edit Players --
PUT: ./set/player { name: playerName }
Returns: Create new player

DELETE: ./set/player/<playerId>
Returns: Delete player

POST: ./set/player/<draftId>/rename { name: newName }
Returns: Change player name

POST: ./set/player/swap { playerA: { id: <playerId>, match: <matchId> }, playerB: ... }
Returns: Swap two players w/in matches
`

// Init
const router = require('express').Router();
const logger = console;

// DB
const players = require('../db/player');

/* SET player database. */

// Swap players
router.post('/swap', (req, res) => players.swap(
    req.body.playerA.id,
    req.body.playerA.match,
    req.body.playerB.id,
    req.body.playerB.match
  ).then(res.send));

// Rename
router.post('/:id/rename', (req, res) => players.rename(req.params.id, req.body.name).then(res.send));

// Create/remove player
router.put('/', (req, res) => players.add(req.body.name).then(res.send));
router.delete('/:id', (req, res) => players.rmv(req.params.id).then(res.send));


module.exports = router;