const logger = require("../utils/log.adapter");

// Convert between values
exports.asType = ({ value, type }) => {
  switch (type) {
    case "string":
      return value;
    case "bigint":
    case "number":
      return +value;
    case "date":
      return new Date(value);
    case "boolean":
      return !value || value === "false" ? false : true;
    case "object":
    default:
      return value ? JSON.parse(value) : value;
  }
};

const toType = (value, type) => {
  switch (type) {
    case "string":
      return value;
    case "bigint":
    case "number":
      return value.toString();
    case "boolean":
      return !value || value === "false" ? "false" : "true";
    case "date":
      if (value.toISOString) return value.toISOString();
      else logger.warn("non-date passed as date", value);
    case "object":
    default:
      return value && JSON.stringify(value);
  }
};

const getType = (value, forceType) => {
  let type = forceType || typeof value;
  if (type === "object" && value && typeof value.toISOString === "function")
    type = "date";
  return { value: toType(value, type), type };
};

exports.toObjArray = (settings) =>
  Object.keys(settings).map((id) => ({ ...getType(settings[id]), id }));

exports.fromObjArray = (settingsArr) =>
  (settingsArr || []).reduce(
    (settings, entry) => ({ ...settings, [entry.id]: exports.asType(entry) }),
    {}
  );
