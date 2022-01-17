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
const controller = require('../controllers/match.controllers');
const action = require('../controllers/action.controllers');

// Gets
router.get('/all/draft/:draftId', controller.getDraftMatches);
router.get('/all', controller.getAllMatches);
router.get('/:matchId', controller.getMatch);

// Sets
router.patch('/util/swap', action.swapPlayers);
router.post(  '/:id', controller.reportMatch);
router.delete('/:id', controller.unreportMatch);
router.patch( '/:id', controller.updateMatch);

module.exports = router;