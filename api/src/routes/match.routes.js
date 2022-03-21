// Init
const router = require('express').Router();
const validate = require('../validators/match.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/match.controllers');
const action = require('../controllers/action.controllers');

// *** Match API commands *** \\

// Gets
router.get('/all',                              catcher(controller.getAllMatches));
router.get('/event/:eventid', validate.eventid, catcher(controller.getEventMatches));

// Sets
router.post(  '/swap',     validate.swapPlayers, catcher(action.swapPlayers));
router.patch( '/:id/drop', validate.updateDrops, catcher(controller.updateDrops));
router.post(  '/:id',      validate.reportMatch, catcher(controller.reportMatch));
router.delete('/:id',      validate.matchId,     catcher(controller.unreportMatch));
router.patch( '/:id',      validate.updateMatch, catcher(controller.updateMatch));

module.exports = router;