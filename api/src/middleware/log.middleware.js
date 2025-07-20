// Initialize logging on requests
const morgan = require("morgan");
const logger = require("../utils/log.adapter");
const { morganLog } = require("../config/meta");

function setupLogging(req, res, next) {
  // Log request
  logger.info("REQ:", req.method, req.originalUrl, req.body);

  // Log response
  res.sendAndLog = (...args) => {
    logger.info(
      "RES:",
      res.statusCode,
      req.originalUrl,
      ...args.map((a) =>
        typeof a !== "object" || a.error
          ? a
          : Object.keys(a).map((k) => (a[k] ? "" : "!") + k)
      )
    );
    return res.send(...args);
  };

  // Bypass CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
}

function bypassLogging(req, res, next) {
  res.sendAndLog = res.send;
  return next();
}

module.exports =
  morganLog && morganLog.toLowerCase() === "debug"
    ? setupLogging
    : [bypassLogging, morgan(morganLog || "combined")];
