/* *** DRAFT CLOCK Sub-Object *** */

// Imports
const ops = require('./admin/base');
const { toCount, toRemaining, toState, calcAll } = require('../services/dbClock');
// const clockStates = require('./constants').clockStates;

// Clock Base Ops
const get = (draftId, cols="*") => ops.getRow(
    'draftClock', draftId, cols
);

const start = draftId => ops.query(
    "UPDATE draft SET clockStart = now() WHERE id = $1;",
    [draftId]
);
const pause = draftId => ops.query(
    "UPDATE draft SET "+
        "clockMod = (now() - ("+
            "SELECT clockstart FROM draft WHERE id = $1"+
        ")), clockStart = NULL "+
    "WHERE id = $1;",
    [draftId]
);
const reset = draftId => ops.query(
    "UPDATE draft SET clockStart = NULL, clockMod = NULL WHERE id = $1;",
    [draftId]
);

// Exports
module.exports = {
    // Setters
    start, pause, reset,

    // Getters
    getClock:     draftId => get(draftId),
    getCount:     draftId => get(draftId,['startMod','mod','lim']).then(toCount),
    getRemaining: draftId => get(draftId,['endTime','mod','lim']).then(toRemaining),
    getState:     draftId => get(draftId,['state','endTime']).then(toState),
    getEndTime:   draftId => get(draftId,['endTime']).then(({end})=>end),
    getAll:       draftId => get(draftId).then(calcAll),

    // getBase:      draftId => ops.getRow('draft',draftId,['id','clockLimit','clockStart','clockMod']),
}