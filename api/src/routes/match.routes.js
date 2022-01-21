// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/match.controllers');
const action = require('../controllers/action.controllers');


// *** Match API commands *** \\

// Gets
router.get('/all/draft/:draftId', catcher(controller.getDraftMatches));
router.get('/all', catcher(controller.getAllMatches));
router.get('/:matchId', catcher(controller.getMatch));

// Sets
router.post( '/swap', catcher(action.swapPlayers));
router.post(  '/:id', catcher(controller.reportMatch));
router.delete('/:id', catcher(controller.unreportMatch));
router.patch( '/:id', catcher(controller.updateMatch));

module.exports = router;