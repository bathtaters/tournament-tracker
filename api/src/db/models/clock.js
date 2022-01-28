/* *** EVENT CLOCK Sub-Object *** */
const db = require('../admin/interface');
const RawPG = require('../admin/RawPG');
const sqlStrings = require('../sql/strings').clock;


// Event Clock Operations //

const get = eventId => db.getRow(
    'event', eventId,
    ['id','clocklimit','clockstart','clockmod']
);

const start = eventId => db.updateRow(
    'event', eventId,
    { clockstart: RawPG('now()') }
);

const pause = eventId => db.updateRow(
    'event', eventId, {
        clockmod: sqlStrings.modPause,
        clockstart: null,
    }
);

const reset = eventId => db.updateRow('event', eventId, {
    clockstart: null, clockmod: null
});


// Exports
module.exports = { get, start, pause, reset, };