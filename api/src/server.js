const express = require('express');
const app = express();
const port = process.env.PORT || 9090;

// Setup middleware
app.use(express.json());
app.use(require('./middleware/log.middleware'));

// Setup routes
app.use('/api/v1', require('./routes/base.routes'));
app.use('/api/v1/draft', require('./routes/draft.routes'));
app.use('/api/v1/match', require('./routes/match.routes'));
app.use('/api/v1/player', require('./routes/player.routes'));

// Error handler
app.use(require('./middleware/error.middleware'));

app.listen(port, () => console.log(`Listening on port ${port}`));
