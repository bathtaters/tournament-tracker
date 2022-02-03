// Init
const router = require('express').Router();
const validate = require('../validators/player.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/player.controllers');


// *** Player API commands *** \\

// Gets
router.get('/all',                           catcher(controller.getAllPlayers));
router.get('/:id',        validate.playerid, catcher(controller.getPlayer));
router.get('/:id/events', validate.playerid, catcher(controller.getPlayerEvents));

// Sets
router.post('/',      validate.createPlayer, catcher(controller.createPlayer));
router.delete('/:id', validate.playerid,     catcher(controller.removePlayer));
router.patch('/:id',  validate.updatePlayer, catcher(controller.updatePlayer));


module.exports = router;