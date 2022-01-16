/* *** DRAFT CLOCK Sub-Object *** */
const db = require('../admin/interface');
const RawPG = require('../admin/RawPG');
const sqlStrings = require('../sql/strings').clock;


// Draft Clock Operations //

const get = draftId => db.getRow(
    'draft', draftId,
    ['id','clocklimit','clockstart','clockmod']
);

const start = draftId => db.updateRow(
    'draft', draftId,
    { clockstart: RawPG('now()') }
);

const pause = draftId => db.updateRow(
    'draft', draftId, {
        clockmod: sqlStrings.modPause,
        clockstart: null,
    }
);

const reset = draftId => db.updateRow('draft', draftId, {
    clockstart: null, clockmod: null
});


// Exports
module.exports = { get, start, pause, reset, };