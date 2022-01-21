// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/draft.controllers');
const action = require('../controllers/action.controllers');


// *** Draft API commands *** \\

// Get
router.get('/all', catcher(controller.getAllDrafts));
router.get('/:id', catcher(controller.getDraft));

router.get('/all/breakers', catcher(controller.getAllBreakers));
router.get('/:id/breakers', catcher(controller.getBreakers));

// Set
router.post('/', catcher(controller.createDraft));
router.delete('/:id', catcher(controller.removeDraft));
router.patch('/:id', catcher(controller.updateDraft));

router.post(  '/:id/round', catcher(action.nextRound));
router.delete('/:id/round', catcher(action.prevRound));

module.exports = router;