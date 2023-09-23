// Init
const router = require('express').Router();
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/plan.controllers');

// *** Plan API commands *** \\

router.get('/status',    catcher(controller.getStatus));
router.post('/generate', catcher(controller.genPlan));
router.post('/save',     catcher(controller.savePlan));
router.delete('/',       catcher(controller.resetPlan));

module.exports = router;