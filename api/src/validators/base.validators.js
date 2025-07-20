const validate = require("./shared.validators").bySet("settings");

module.exports = {
  getSetting: validate("setting"),
  setSettings: validate(0, "all", 1),
};
