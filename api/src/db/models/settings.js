/* *** SETTINGS Operations *** */
const db = require("../admin/interface");
const log = require("./log");

// Batch get settings object
const getAll = () => db.getRows("settings");

// Batch set from array of row objects
const batchSet = (settings, req) =>
  log.addRows("settings", settings, req, { upsert: true });

module.exports = {
  batchSet,
  getAll,
  get: (settings) =>
    Array.isArray(settings)
      ? db.getRows("settings", "WHERE id = ANY($1)", [settings])
      : db.getRow("settings", settings),
  rmv: (id, req) => log.rmvRows("settings", id, null, req),
};
