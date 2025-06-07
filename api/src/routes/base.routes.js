// Init
const router = require('express').Router();
const validate = require('../validators/base.validators');
const controller = require('../controllers/base.controllers');
const { name, version } = require('../config/meta');
const { testError } = require('../config/constants');


// *** Base API commands *** \\

// Test Api
router.get('/meta',  (_, res) => res.sendAndLog({ connected: true, name, version }));
router.get('/error', (_, res) => { throw testError; });

// All data
router.get('/all', controller.getAll);

// Settings
router.get('/settings',          controller.getSettings);
router.get('/settings/:setting', validate.getSetting,  controller.getSetting);
router.patch('/settings',        validate.setSettings, controller.setSettings);

// Schedule
router.get('/schedule/plan', controller.getSchedule(true));
router.get('/schedule', controller.getSchedule());

// RESET TO DEMO DB (Dev only)
router.post('/reset/full', controller.resetDB(true));
router.post('/reset', controller.resetDB());

module.exports = router;