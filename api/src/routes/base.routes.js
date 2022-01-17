` *** Public API commands ***

 -- Get Base --
GET: ./all
Returns: all data from db as object

GET: ./settings
Returns: settings object

GET: ./schedule
Returns: schedule data

-- Set Base --
PATCH: ./settings
Returns: update settings => { success: true (false on fail) }

POST: ./reset(/full) /* For Dev Only */
Returns: (full) reset of DB => { reset: true, full: false/(true) }
`

// Init
const router = require('express').Router();
const controller = require('../controllers/base.controllers');
const { name, version } = require('../config/meta');
const testError = require('../config/constants.json').testError;

// Test Api
router.get('/test', (_, res) => res.sendAndLog({ connected: true, name, version }));
router.get('/error', (_,res) => { throw testError; });

// All data
router.get('/all', controller.getAll);

// Settings
router.get('/settings', controller.getSettings);
router.patch('/settings', controller.setSettings);

// Schedule
router.get('/schedule', controller.getSchedule);


// RESET TO DEMO DB (Dev only)
router.post('/reset/full', controller.resetDB(true));
router.post('/reset', controller.resetDB());

module.exports = router;