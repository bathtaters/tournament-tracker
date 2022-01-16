function setupLogging(req, res, next) {
  console.log('REQ:',req.originalUrl,req.method,req.body);
  res.sendAndLog = (...args) => { console.log('RES:', ...args.map(a => typeof a === 'object' && !a.error ? Object.keys(a) : a)); return res.send(...args); };
  res.setHeader('Access-Control-Allow-Origin','*'); // To bypass CORS
  return next();
}

module.exports = setupLogging;