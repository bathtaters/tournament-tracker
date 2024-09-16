// Init
const router = require('express').Router();
const validate = require('../validators/session.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/session.controllers');

// *** Session Cookie API commands *** \\
router.get('/',                          catcher(controller.fetch));
router.get('/player',                    catcher(controller.player));
router.post('/',    validate.login,      catcher(controller.login));
router.delete('/',                       catcher(controller.logout));
router.post('/:id', validate.idSession,  catcher(controller.resetStatus));

module.exports = router;