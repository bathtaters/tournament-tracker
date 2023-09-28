// Init
const router = require('express').Router();
const validate = require('../validators/session.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/session.controllers');

// *** Session Cookie API commands *** \\
router.post('/',    validate.session,    catcher(controller.fetch));
router.put('/',     validate.login,      catcher(controller.login));
router.delete('/',  validate.session,    catcher(controller.logout));
router.post('/:id', validate.idSession,  catcher(controller.canReset));

module.exports = router;