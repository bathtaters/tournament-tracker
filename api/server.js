const express = require('express');
const app = express();
const port = process.env.PORT || 9090;


app.get('/test_backend', (req, res) => {
    return res.send({
        result: 'Connected to internal API server.'
    });
});

// Error handler
app.use(function(err, req, res, next) {
    if (!req.error) req.error = err;
    res.status((req.error && req.error.status) || 500);
    return res.send((req.error && req.error.message) || { message: 'Unknown server error' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

// Testing
require('./testing/checkDb');