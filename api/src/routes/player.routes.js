// Init
const router = require('express').Router();
const validate = require('../validators/player.validators');
const controller = require('../controllers/player.controllers');


// *** Player API commands *** \\

// Gets
router.get('/all',                            controller.getAllPlayers);
router.get('/:id',         validate.playerid, controller.getPlayer);
router.get('/:id/events',  validate.playerid, controller.getPlayerEvents);
router.get('/:id/matches', validate.playerid, controller.getPlayerMatches);

// Sets
router.post('/',          validate.createPlayer, controller.createPlayer);
router.delete('/:id',     validate.playerid,     controller.removePlayer);
router.patch('/:id',      validate.updatePlayer, controller.updatePlayer);
router.post('/:id/reset', validate.playerid,     controller.resetPassword);


module.exports = router;