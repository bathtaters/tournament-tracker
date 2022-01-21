// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/player.controllers');


// *** Player API commands *** \\

// Gets
router.get('/all', catcher(controller.getAllPlayers));
router.get('/:id', catcher(controller.getPlayer));
router.get('/:id/drafts', catcher(controller.getPlayerDrafts));

// Sets
router.post('/', catcher(controller.createPlayer));
router.delete('/:id', catcher(controller.removePlayer));
router.patch('/:id', catcher(controller.updatePlayer));


module.exports = router;