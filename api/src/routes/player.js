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
 Returns: Create new player => { id }
 
 DELETE: ./player/<playerId>
 Returns: Delete player => { id }
 
 PATCH: ./player/<playerId> { id, name: newName }
 Returns: Change player name => { id }
`

// Init
const router = require('express').Router();
const logger = console;
const { arrToObj } = require('../helpers/utils');

// DB
const players = require('../db/controllers/player');

/* GET player database. */

// All players
router.get('/all', async function(req, res) {
  const playerData = await players.get().then(arrToObj('id'));
  res.sendAndLog(playerData);
});

// Individual player
router.get('/:id', async function(req, res) {
  const playerData = await players.get(req.params.id);
  res.sendAndLog(playerData);
});

router.get('/:id/drafts', async function(req, res) {
  const playerDrafts = await players.getDrafts(req.params.id);
  res.sendAndLog(playerDrafts);
});


/* SET player database. */

// Create/remove player
router.post('/', (req, res) => players.add(req.body).then(res.sendAndLog));
router.delete('/:id', (req, res) => players.rmv(req.params.id).then(res.sendAndLog));

// Rename
router.patch('/:id', (req, res) => players.set(req.params.id, req.body).then(res.sendAndLog));


module.exports = router;