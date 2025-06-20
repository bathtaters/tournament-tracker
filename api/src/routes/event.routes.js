// Init
const router = require('express').Router();
const validate = require('../validators/event.validators');
const controller = require('../controllers/event.controllers');
const stats = require('../controllers/stats.controllers');
const action = require('../controllers/action.controllers');


// *** Event API commands *** \\

// Get
router.get('/all',                   controller.getAllEvents);
router.get('/:id', validate.eventid, controller.getEvent);

router.get('/all/stats',                        stats.getAllStats);
router.get('/:id/stats',      validate.eventid, stats.getStats);
router.get('/:id/clock',      validate.eventid, controller.getClock);

// Credits
router.post('/all/credits',                     stats.resetAllCredits(true));
router.delete('/all/credits',                   stats.resetAllCredits(false));
router.post('/:id/credits',   validate.eventid, stats.setCredits(false));
router.delete('/:id/credits', validate.eventid, stats.setCredits(true));

// Set
router.post('/plan',  validate.setPlan,     controller.setPlan);
router.post('/',      validate.createEvent, controller.createEvent);
router.delete('/:id', validate.eventid,     controller.removeEvent);
router.patch( '/:id', validate.updateEvent, controller.updateEvent);

// Clock
router.post('/:id/clock/run',   validate.eventid, controller.clockOp('run'));
router.post('/:id/clock/reset', validate.eventid, controller.clockOp('reset'));
router.post('/:id/clock/pause', validate.eventid, controller.clockOp('pause'));

// Create matches
router.post(  '/:id/round/:roundactive', validate.rounds, action.nextRound);
router.delete('/:id/round/:roundactive', validate.rounds, action.prevRound);

module.exports = router;