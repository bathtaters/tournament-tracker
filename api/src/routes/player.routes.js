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
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/player.controllers');

// Gets
router.get('/all', catcher(controller.getAllPlayers));
router.get('/:id', catcher(controller.getPlayer));
router.get('/:id/drafts', catcher(controller.getPlayerDrafts));

// Sets
router.post('/', catcher(controller.createPlayer));
router.delete('/:id', catcher(controller.removePlayer));
router.patch('/:id', catcher(controller.updatePlayer));

module.exports = router;