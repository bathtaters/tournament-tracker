// Init
const router = require('express').Router();
const validate = require('../validators/session.validators');
const controller = require('../controllers/session.controllers');

// *** Session Cookie API commands *** \\
router.get('/',                          controller.fetch);
router.get('/player',                    controller.player);
router.post('/',    validate.login,      controller.login);
router.delete('/',                       controller.logout);
router.post('/:id', validate.idSession,  controller.resetStatus);

module.exports = router;