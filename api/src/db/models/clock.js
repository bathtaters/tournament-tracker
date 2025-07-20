/* *** EVENT CLOCK Sub-Object *** */
const db = require("../admin/interface");
const log = require("./log");
const sqlStrings = require("../sql/strings").clock;

// Event Clock Operations //

const get = (eventid) =>
  db.getRow("event", eventid, ["id", "clocklimit", "clockstart", "clockmod"]);

const run = (eventid, req) =>
  log.query(
    sqlStrings.start,
    [eventid],
    (data, error) =>
      error || !data?.length
        ? {
            tableid: eventid,
            error: error || "Event not found or clock already running",
            dbtable: log.TableName.EVENT,
            action: log.LogAction.UPDATE,
            data: { clockstart: "now() - clockmod", clockmod: null },
          }
        : data.map((entry) => ({
            tableid: entry.id || eventid,
            dbtable: log.TableName.EVENT,
            action: log.LogAction.UPDATE,
            data: { clockstart: entry.clockstart, clockmod: entry.clockmod },
          })),
    req
  );

const pause = (eventid, req) =>
  log.query(
    sqlStrings.pause,
    [eventid],
    (data, error) =>
      error || !data?.length
        ? {
            tableid: eventid,
            error: error || "Event not found or clock is not running",
            dbtable: log.TableName.EVENT,
            action: log.LogAction.UPDATE,
            data: { clockstart: null, clockmod: "now() - clockstart" },
          }
        : data.map((entry) => ({
            tableid: entry.id || eventid,
            dbtable: log.TableName.EVENT,
            action: log.LogAction.UPDATE,
            data: { clockstart: entry.clockstart, clockmod: entry.clockmod },
          })),
    req
  );

const reset = (eventid, req) =>
  log.updateRows(
    "event",
    eventid,
    {
      clockstart: null,
      clockmod: null,
    },
    req
  );

// Exports
module.exports = { get, run, pause, reset };
