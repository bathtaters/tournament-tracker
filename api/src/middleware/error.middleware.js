// Handle error response to client
const defaultError = require('../config/constants.json').defaultError;

function handleError(err, req, res) {
  if (!req.error) req.error = err;

  res.status((req.error && req.error.status) || defaultError.status);
  return res.sendAndLog({ error: req.error ? req.error.message || req.error : defaultError.message });
}

module.exports = handleError;