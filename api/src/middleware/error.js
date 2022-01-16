const defaultError = { status: 500, message: 'Unknown server error' }; // MOVE TO CONFIG

function handleError(err, req, res, next) {
  if (!req.error) req.error = err;

  res.status((req.error && req.error.status) || defaultError.status);
  return res.sendAndLog({ error: req.error ? req.error.message || req.error : defaultError.message });
}

module.exports = handleError;