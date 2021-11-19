` *** Public API commands ***

 -- LEGEND --
draftId = UUID for draft entry
matchId = UUID for match entry
playerId = UUID for player entry

-- Get Players --
GET: ./player/all | <playerId>
Returns: { ...data from all/a players }

 -- Edit Players --
POST: ./player { name: playerName }
Returns: Create new player > { id: playerId }

DELETE: ./player/<playerId>
Returns: Delete player > { id: playerId }

PATCH: ./player/<draftId> { name: newName }
Returns: Change player name > { ...data from player }

POST: ./player/swap { playerA: { id: <playerId>, match: <matchId> }, playerB: ... }
Returns: Swap two players w/in matches > { success: true }
`

// Init
const router = require('express').Router();
const logger = console;

// DB
const players = require('../db/player');

/* GET player database. */

// All players
router.get('/all', async function(req, res) {
  const players = await player.list().then(arrToObj('id'));
  res.sendAndLog(players);
});

// Individual player
router.get('/:id', async function(req, res) {
  const playerData = await player.get(req.params.id);
  res.sendAndLog(playerData);
});


/* SET player database. */

// Swap players
router.post('/swap', (req, res) => players.swap(
  req.body.playerA.id,
  req.body.playerA.match,
  req.body.playerB.id,
  req.body.playerB.match
).then(res.sendAndLog));

// Create/remove player
router.post('/', (req, res) => players.add(req.body.name).then(res.sendAndLog));
router.delete('/:id', (req, res) => players.rmv(req.params.id).then(res.sendAndLog));

// Rename
router.patch('/:id', (req, res) => players.rename(req.params.id, req.body.name).then(res.sendAndLog));


module.exports = router;