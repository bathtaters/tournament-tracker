// Initialize logging on requests
const logger = console;

function setupLogging(req, res, next) {
  // Log request
  logger.info('REQ:',req.method,req.originalUrl,req.body);

  // Log response
  res.sendAndLog = (...args) => { 
    logger.info('RES:',res.statusCode,req.originalUrl, ...args.map(a =>
      typeof a !== 'object' || a.error ? a :
      Object.keys(a).map(k => (a[k] ? '' : '!') + k)
    ));
    return res.send(...args);
  };

  // Bypass CORS
  res.setHeader('Access-Control-Allow-Origin','*');
  return next();
}

module.exports = setupLogging;