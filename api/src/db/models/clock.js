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

const start = (eventid, userid) => log.updateRows('event', eventid, {
    clockstart: RawPG('now()')
}, userid);

const pause = (eventid, userid) => log.updateRows('event', eventid, {
    clockmod: sqlStrings.modPause,
    clockstart: null,
}, userid);

const reset = (eventid, userid) => log.updateRows('event', eventid, {
    clockstart: null, clockmod: null
}, userid);


// Exports
module.exports = { get, start, pause, reset, };