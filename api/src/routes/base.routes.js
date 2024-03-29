// Init
const router = require('express').Router();
const validate = require('../validators/base.validators');
const catcher = require('../middleware/catch.middleware');
const controller = require('../controllers/base.controllers');
const { name, version } = require('../config/meta');
const { testError } = require('../config/constants');


// *** Base API commands *** \\

// Test Api
router.get('/meta',  (_, res) => res.sendAndLog({ connected: true, name, version }));
router.get('/error', (_, res) => { throw testError; });

// All data
router.get('/all', catcher(controller.getAll));

// Settings
router.get('/settings',          catcher(controller.getSettings));
router.get('/settings/:setting', validate.getSetting,  catcher(controller.getSetting));
router.patch('/settings',        validate.setSettings, catcher(controller.setSettings));

// Schedule
router.get('/schedule/plan', catcher(controller.getSchedule(true)));
router.get('/schedule', catcher(controller.getSchedule()));

// RESET TO DEMO DB (Dev only)
router.post('/reset/full', catcher(controller.resetDB(true)));
router.post('/reset', catcher(controller.resetDB()));

module.exports = router;