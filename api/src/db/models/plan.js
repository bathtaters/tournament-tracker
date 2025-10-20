/* *** PLAN Object *** */
const log = require("./log");
const sql = require("../sql/strings").plan;
const { TableName, LogAction } = require("../../config/validation").enums;

// Set multiple events to given dates [{ id, ...data }]
const multiset = (plan, req) =>
  log.updateRows("event", null, plan, req, {
    types: {
      id: "UUID",
      day: "DATE",
      players: "UUID[]",
      slot: "SMALLINT",
    },
  });

// De-schedule all un-planned events, schedule all planned events
const update = (update, id, idCol, req) =>
  log.updateRows("event", id, update, req, { idCol, returnArray: true });

// Remove all voters/planned events and settings
const reset = (req) =>
  Promise.all(
    sql.reset.map((sqlCmd, idx) =>
      log.query(
        sqlCmd,
        null,
        (_, error) =>
          [
            {
              dbtable: TableName.VOTER,
              action: LogAction.DELETE,
              tableid: "*",
              error,
            },
            {
              dbtable: TableName.EVENT,
              action: LogAction.UPDATE,
              tableid: "*",
              data: { plan: false },
              error,
            },
            [
              {
                dbtable: TableName.SETTINGS,
                action: LogAction.DELETE,
                tableid: "plandates",
                error,
              },
              {
                dbtable: TableName.SETTINGS,
                action: LogAction.DELETE,
                tableid: "planslots",
                error,
              },
            ],
          ][idx],
        req,
      ),
    ),
  );

module.exports = { multiset, update, reset };
