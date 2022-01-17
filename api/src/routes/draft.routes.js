` *** Public API commands ***

 -- Get Drafts --
GET: ./draft/{all | <draftId>}
Returns: data from all/a drafts

GET: ./draft/<draftId>/breakers
Returns: breakers from draft

 -- Edit Drafts --
POST: ./draft { ...draftData }
Returns: Create new draft

DELETE: ./draft/<draftId>
Returns: Delete draft

PATCH: ./draft/<draftId> { ...draftData }
Returns: Update draft data

POST: ./draft/<draftId>/round
Returns: Create a new round

DELETE: ./draft/<draftId>/round
Returns: Remove last round
`

// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/draft.controllers');
const action = require('../controllers/action.controllers');

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