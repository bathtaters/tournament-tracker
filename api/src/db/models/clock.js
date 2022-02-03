/* *** EVENT CLOCK Sub-Object *** */
const db = require('../admin/interface');
const RawPG = require('../admin/RawPG');
const sqlStrings = require('../sql/strings').clock;


// Event Clock Operations //

const get = eventid => db.getRow(
    'event', eventid,
    ['id','clocklimit','clockstart','clockmod']
);

const start = eventid => db.updateRow(
    'event', eventid,
    { clockstart: RawPG('now()') }
);

const pause = eventid => db.updateRow(
    'event', eventid, {
        clockmod: sqlStrings.modPause,
        clockstart: null,
    }
);

const reset = eventid => db.updateRow('event', eventid, {
    clockstart: null, clockmod: null
});


// Exports
module.exports = { get, start, pause, reset, };