const validate = require("./shared.validators").bySet("settings");

module.exports = {
  getSetting: validate("id"),
  setSettings: validate(null, "all", true),
};
