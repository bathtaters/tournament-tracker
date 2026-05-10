// Build validators based on Config
const { checkSchema } = require("express-validator");
const checkValidation = require("../middleware/validate.middleware");
const {
  getSchema,
  getSchemaFromCfg,
} = require("../services/validate.services");
const validCfg = require("../config/validation");

// Validate using a specific key's config (falsy 'useKey' will use 'key')
exports.usingKey = (
  key,
  useSet,
  useKey = null,
  { isIn = "body", optional = false } = {},
) =>
  checkSchema(
    getSchema(
      key,
      validCfg.types[useSet][useKey || key],
      validCfg.limits[useSet][useKey || key],
      [isIn],
      optional,
    ),
  );

/**
 * @typedef {(
 *    params: "all"|string|string[],
 *    body?: "all"|string|string[],
 *    optionalBody?: boolean,
 *    check?: boolean,
 *    paramsKey?: string
 * ) => Function[]} ValidationBuilder
 * @param {"all"|string|string[]} params - Keys to validate in the params object
 * @param {"all"|string|string[]} [body=[]] - Keys to validate in the body object
 * @param {boolean} [optionalBody=false] - If true, all body keys are optional, unless body key is in params. Also removes any keys in params from body.
 * @param {boolean} [check=true] - Whether to include validation check middleware
 * @param {string} [paramsKey="params"] - The key name for parameters in the request object
 * @returns {Function[]} Array of Express middleware functions for validation
 */

/**
 * Validate by 'set' - Creates validation middleware based on a configuration set
 * @param {string} set - Name of the validation set to use (See keys in validation.json)
 * @returns {ValidationBuilder} Function that builds validation middleware
 */
exports.bySet =
  (set) =>
  (
    params,
    body = [],
    optionalBody = false,
    check = true,
    paramsKey = "params",
  ) =>
    checkSchema(
      getSchemaAdapter(set, { [paramsKey]: params, body }, optionalBody),
    ).concat(check ? checkValidation : []);

// HELPER -- Retrieve validation schema for route based on set & keys
// keys = { [expected location (in req object)]: array of keys in said location }
function getSchemaAdapter(set, keys, optionalBody) {
  // 'all' instead of key array will include validation for all entries
  Object.keys(keys).forEach((t) => {
    if (keys[t] === "all") {
      keys[t] = Object.keys(validCfg.types[set]);
    }
  });

  // Build list of keys (combining unique)
  const keyList = {};
  Object.keys(keys).forEach((inType) => {
    if (keys[inType]) {
      // Force single value into array
      if (!Array.isArray(keys[inType])) keys[inType] = [keys[inType]];

      keys[inType].forEach((key) => {
        if (keyList[key]) keyList[key].push(inType);
        else keyList[key] = [inType];
      });
    }
  });

  // Call getValidation on each entry in keyList to create validationSchema
  return Object.entries(keyList).reduce(
    (valid, [key, isIn]) =>
      Object.assign(valid, getSchemaFromCfg(set, key, isIn, optionalBody)),
    {},
  );
}
