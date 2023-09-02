// Init
const router = require('express').Router();
const validate = require('../validators/plan.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/plan.controllers');

// *** Player API commands *** \\

// Gets
router.get('/player/all',                           catcher(controller.getAllVotes));
router.get('/player/:id',    validate.playerid,     catcher(controller.getVote));

// Sets
router.post(  '/player/',    validate.newPlayer,    catcher(controller.addPlayer));
router.delete('/player/:id', validate.playerid,     catcher(controller.removePlayer));
router.patch( '/player/:id', validate.updatePlayer, catcher(controller.updateVote));


module.exports = router;