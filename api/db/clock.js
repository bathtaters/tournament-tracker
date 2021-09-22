/* *** DRAFT CLOCK Sub-Object *** */

// Imports
const ops = require('./admin/base');
const { toCount, toRemaining, toEndTime, toState, calcAll } = require('../services/dbTranslate');
// const clockStates = require('./constants').clockStates;

// Clock Base Ops
const get = draftId => ops.getRow('draft', draftId, 'clockStart, clockLimit, clockMod');

const start = draftId => ops.accessDb(cl => cl.query(
    "UPDATE draft SET clockStart = now() WHERE id = $1;",
    [draftId]
));
const pause = draftId => ops.accessDb(cl => cl.query(
    "UPDATE draft SET clockMod = CAST((now() - (SELECT clockstart FROM draft WHERE id = $1)) AS DECIMAL), clockStart = NULL WHERE id = $1;",
    [draftId]
));
const reset = draftId => ops.accessDb(cl => cl.query(
    "UPDATE draft SET clockStart = NULL, clockMod = 0 WHERE id = $1;",
    [draftId]
));

// Exports
module.exports = {
    // Setters
    start, pause, reset,

    // Getters
    getCount:     draftId => get(draftId).then(toCount),
    getRemaining: draftId => get(draftId).then(toRemaining),
    getEndTime:   draftId => get(draftId).then(toEndTime),
    getState:     draftId => get(draftId).then(toState),
    getAll:       draftId => get(draftId).then(calcAll),

    // Direct access
    // more: { get, toCount, toRemaining, toEndTime, toState, },
}