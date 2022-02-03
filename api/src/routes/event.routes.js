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

router.get('/all/stats',                   catcher(stats.getAllStats));
router.get('/:id/stats', validate.eventid, catcher(stats.getStats));

// Set
router.post(  '/',    validate.createEvent, catcher(controller.createEvent));
router.delete('/:id', validate.eventid,     catcher(controller.removeEvent));
router.patch( '/:id', validate.updateEvent, catcher(controller.updateEvent));

// Create matches
router.post(  '/:id/round', validate.eventid, catcher(action.nextRound));
router.delete('/:id/round', validate.eventid, catcher(action.prevRound));

module.exports = router;