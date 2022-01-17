// Handle error response to client
const logger = console;

// String formatting
const defaultError = require('../config/constants.json').defaultError;
const getMsg  = err => (err && err.message) || defaultError.message;
const getCode = err => (err && err.status)  || defaultError.status;

const formatErr = err => err.stack || `${err.name || 'Error'} <${getCode(err)}>: ${getMsg(err)}`;

// Middleware
function handleError(err, req, res, _) {
  if (!req.error) req.error = err;
  
  logger.error('Request "'+req.originalUrl+'" encountered:', formatErr(req.error));

  res.status(getCode(req.error));
  return res.sendAndLog({ error: getMsg(req.error) });
}

module.exports = handleError;