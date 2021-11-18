const express = require('express');
const app = express();
const port = process.env.PORT || 9090;

// Setup routes
app.use('/api/v1/get', require('./routes/getDb'));
app.use('/api/v1/set/draft', require('./routes/setDraft'));
app.use('/api/v1/set/player', require('./routes/setPlayer'));

// TEST BACKEND & RESET TO DEMO DB (Temp)
app.get('/api/v1/test_backend', (req, res) => res.send({result: 'Connected to internal API server.'}));
const dbOp = require('./db/admin/base');
const dbTestFile = require('path').join(__dirname,'testing','dbtest.sql');
app.get('/api/v1/set/resetDb', async function(req, res) {
    await dbOp.execFile(dbTestFile);
    res.send({reset: true});
})

// Error handler
app.use(function(err, req, res, next) {
    if (!req.error) req.error = err;
    res.status((req.error && req.error.status) || 500);
    return res.send((req.error && req.error.message) || { message: 'Unknown server error' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

// Testing
// require('./testing/checkDb');