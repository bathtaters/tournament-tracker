const express = require('express');
const app = express();
const port = process.env.PORT || 9090;

// Setup middleware
app.use(express.json());

// Logging
app.use(function(req, res, next) {
    console.log('REQ:',req.originalUrl,req.method,req.body);
    res.sendAndLog = (...args) => { console.log('RES:', ...args.map(a => typeof a === 'object' && !a.error ? Object.keys(a) : a)); return res.send(...args); };
    res.setHeader('Access-Control-Allow-Origin','*'); // To bypass CORS
    return next();
});

// Setup routes
app.use('/api/v1', require('./routes/base'));
app.use('/api/v1/draft', require('./routes/draft'));
app.use('/api/v1/match', require('./routes/match'));
app.use('/api/v1/player', require('./routes/player'));

// Error handler
const defaultError = { status: 500, message: 'Unknown server error' };
app.use(function(err, req, res, next) {
    if (!req.error) req.error = err;
    res.status((req.error && req.error.status) || defaultError.status);
    return res.sendAndLog({ error: req.error ? req.error.message || req.error : defaultError.message });
});

app.listen(port, () => console.log(`Listening on port ${port}`));