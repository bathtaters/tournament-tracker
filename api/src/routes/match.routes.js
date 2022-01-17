` *** Public API commands ***

 -- Get Matches --
 GET: ./match/{all | <matchId>}
 Returns: { ...data from all/a match }

 GET: ./match/all/draft/<draftId>
 Returns: { ...data from all matches w/in draft }

 -- Edit Matches --
POST: ./match/<matchId> { ...reportData }
Returns: Report wins/losses/etc for match => { [draft]id }

DELETE: ./match/<matchId>
Returns: Clear reported wins/losses/etc for match => { [draft]id }

PATCH: ./match/<matchId>
Returns: Update reported wins/losses/etc for match => { [draft]id }

PATCH: ./match/swap [ { id: <playerId>, match: <matchId> }, ... ]
Returns: Swap two players w/in matches => { [draft]id }
`

// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/match.controllers');
const action = require('../controllers/action.controllers');

// Gets
router.get('/all/draft/:draftId', catcher(controller.getDraftMatches));
router.get('/all', catcher(controller.getAllMatches));
router.get('/:matchId', catcher(controller.getMatch));

// Sets
router.patch('/util/swap', catcher(action.swapPlayers));
router.post(  '/:id', catcher(controller.reportMatch));
router.delete('/:id', catcher(controller.unreportMatch));
router.patch( '/:id', catcher(controller.updateMatch));

module.exports = router;