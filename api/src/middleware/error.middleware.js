// Handle error response to client
const logger = require("../utils/log.adapter");

// String formatting
const defaultError = require("../config/constants").defaultError;
const getMsg = (err) => err?.message || err || defaultError.message;
const getCode = (err) => err?.status || defaultError.status;

const formatErr = (err) =>
  err.stack || `${err.name || "Error"} <${getCode(err)}>: ${getMsg(err)}`;

// Middleware
function handleError(err, req, res, _) {
  if (!req.error) req.error = err;
  const code = getCode(req.error);

  if (code > 300 || code < 200)
    logger.error(
      'Request "' + req.originalUrl + '" encountered:',
      formatErr(req.error)
    );

  res.status(code);
  return res.sendAndLog({ error: getMsg(req.error) });
}

module.exports = handleError;
