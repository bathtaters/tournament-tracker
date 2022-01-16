// Initialize logging on requests
const logger = console;

function setupLogging(req, res, next) {
  // Log request
  logger.log('REQ:',req.originalUrl,req.method,req.body);

  // Log response
  res.sendAndLog = (...args) => { 
    logger.log('RES:', req.originalUrl, res.statusCode, ...args.map(a =>
      typeof a === 'object' && !a.error ? Object.keys(a) : a
    ));
    return res.send(...args);
  };

  // Bypass CORS
  res.setHeader('Access-Control-Allow-Origin','*');
  return next();
}

module.exports = setupLogging;