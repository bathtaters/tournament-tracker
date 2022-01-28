// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/event.controllers');
const stats = require('../controllers/stats.controllers');
const action = require('../controllers/action.controllers');


// *** Event API commands *** \\

// Get
router.get('/all', catcher(controller.getAllEvents));
router.get('/:id', catcher(controller.getEvent));

router.get('/all/stats', catcher(stats.getAllStats));
router.get('/:id/stats', catcher(stats.getStats));

// Set
router.post('/', catcher(controller.createEvent));
router.delete('/:id', catcher(controller.removeEvent));
router.patch('/:id', catcher(controller.updateEvent));

router.post(  '/:id/round', catcher(action.nextRound));
router.delete('/:id/round', catcher(action.prevRound));

module.exports = router;