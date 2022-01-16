const express = require('express');
const app = express();
const port = process.env.PORT || 9090;

// Setup middleware
app.use(express.json());
app.use(require('./middleware/logging'));

// Setup routes
app.use('/api/v1', require('./routes/base'));
app.use('/api/v1/draft', require('./routes/draft'));
app.use('/api/v1/match', require('./routes/match'));
app.use('/api/v1/player', require('./routes/player'));

// Error handler
app.use(require('./middleware/error'));

app.listen(port, () => console.log(`Listening on port ${port}`));
