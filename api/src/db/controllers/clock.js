/* *** DRAFT CLOCK Sub-Object *** */
const ops = require('../admin/basicAccess');
const RawPG = require('../admin/RawPG');
const sqlStrings = require('../sql/strings').clock;


// Draft Clock Operations //

const get = draftId => ops.getRow(
    'draft', draftId,
    ['id','clocklimit','clockstart','clockmod']
);

const start = draftId => ops.updateRow(
    'draft', draftId,
    { clockstart: RawPG('now()') }
);

const pause = draftId => ops.updateRow(
    'draft', draftId, {
        clockmod: sqlStrings.modPause,
        clockstart: null,
    }
);

const reset = draftId => ops.updateRow('draft', draftId, {
    clockstart: null, clockmod: null
});


// Exports
module.exports = { get, start, pause, reset, };