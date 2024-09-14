/* *** EVENT CLOCK Sub-Object *** */
const db = require('../admin/interface');
const log = require('./log');
const RawPG = require('../admin/RawPG');
const sqlStrings = require('../sql/strings').clock;


// Event Clock Operations //

const get = (eventid) => db.getRow(
    'event', eventid,
    ['id','clocklimit','clockstart','clockmod']
);

const start = (eventid, req) => log.updateRows('event', eventid, {
    clockstart: RawPG('now()')
}, req);

const pause = (eventid, req) => log.updateRows('event', eventid, {
    clockmod: sqlStrings.modPause,
    clockstart: null,
}, req);

const reset = (eventid, req) => log.updateRows('event', eventid, {
    clockstart: null, clockmod: null
}, req);


// Exports
module.exports = { get, start, pause, reset, };