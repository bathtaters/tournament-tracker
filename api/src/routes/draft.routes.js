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
const controller = require('../controllers/draft.controllers');
const action = require('../controllers/action.controllers');

// Get
router.get('/all', controller.getAllDrafts);
router.get('/:id', controller.getDraft);

router.get('/all/breakers', controller.getAllBreakers);
router.get('/:id/breakers', controller.getBreakers);

// Set
router.post('/', controller.createDraft);
router.delete('/:id', controller.removeDraft);
router.patch('/:id', controller.updateDraft);

router.post(  '/:id/round', action.nextRound);
router.delete('/:id/round', action.prevRound);

module.exports = router;