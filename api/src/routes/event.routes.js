// Init
const router = require('express').Router();
const validate = require('../validators/event.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/event.controllers');
const stats = require('../controllers/stats.controllers');
const action = require('../controllers/action.controllers');


// *** Event API commands *** \\

// Get
router.get('/all',                   catcher(controller.getAllEvents));
router.get('/:id', validate.eventid, catcher(controller.getEvent));

router.get('/all/stats',                        catcher(stats.getAllStats));
router.get('/:id/stats',      validate.eventid, catcher(stats.getStats));
router.get('/:id/clock',      validate.eventid, catcher(controller.getClock));

// Credits
router.post('/all/credits',                     catcher(stats.resetAllCredits(true)));
router.delete('/all/credits',                   catcher(stats.resetAllCredits(false)));
router.post('/:id/credits',   validate.eventid, catcher(stats.setCredits(false)));
router.delete('/:id/credits', validate.eventid, catcher(stats.setCredits(true)));

// Set
router.post('/plan',  validate.setPlan,     catcher(controller.setPlan));
router.post('/',      validate.createEvent, catcher(controller.createEvent));
router.delete('/:id', validate.eventid,     catcher(controller.removeEvent));
router.patch( '/:id', validate.updateEvent, catcher(controller.updateEvent));

// Clock
router.post('/:id/clock/run',   validate.eventid, catcher(controller.clockOp('run')));
router.post('/:id/clock/reset', validate.eventid, catcher(controller.clockOp('reset')));
router.post('/:id/clock/pause', validate.eventid, catcher(controller.clockOp('pause')));

// Create matches
router.post(  '/:id/round/:roundactive', validate.rounds, catcher(action.nextRound));
router.delete('/:id/round/:roundactive', validate.rounds, catcher(action.prevRound));

module.exports = router;