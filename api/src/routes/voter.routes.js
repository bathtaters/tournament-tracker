// Init
const router = require('express').Router();
const validate = require('../validators/voter.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/voter.controllers');

// *** Player API commands *** \\

// Gets
router.get('/all',                         catcher(controller.getAllVotes));
router.get('/:id',   validate.playerid,    catcher(controller.getVote));

// Sets
router.post('/',     validate.setVoters,   catcher(controller.setVoters));
router.patch('/:id', validate.updateVotes, catcher(controller.updateVote));

module.exports = router;