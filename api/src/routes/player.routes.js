` *** Public API commands ***

-- Get Players --
GET: ./player/{all | <playerId>}
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
const controller = require('../controllers/player.controllers');

// Gets
router.get('/all', controller.getAllPlayers);
router.get('/:id', controller.getPlayer);
router.get('/:id/drafts', controller.getPlayerDrafts);

// Sets
router.post('/', controller.createPlayer);
router.delete('/:id', controller.removePlayer);
router.patch('/:id', controller.updatePlayer);

module.exports = router;