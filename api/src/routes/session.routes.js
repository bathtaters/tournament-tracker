// Init
const router = require('express').Router();
const validate = require('../validators/session.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/session.controllers');

// *** Session Cookie API commands *** \\
router.get('/',    validate.session, catcher(controller.fetch));
router.post('/',   validate.login,   catcher(controller.login));
router.delete('/', validate.session, catcher(controller.logout));

module.exports = router;