const express = require('express');
const app = express();
const logger = console;
const { name, port, apiVersion: version } = require('./config/meta');

// Setup middleware
app.use(express.json());
app.use(require('./middleware/log.middleware'));

// Setup routes
app.use('/api/version', (_, res) => res.sendAndLog('v' + version));
app.use(`/api/v${version}`,        require('./routes/base.routes'));
app.use(`/api/v${version}/draft`,  require('./routes/draft.routes'));
app.use(`/api/v${version}/match`,  require('./routes/match.routes'));
app.use(`/api/v${version}/player`, require('./routes/player.routes'));

// Error handling
app.use(() => { throw require('./config/constants.json').missingError; })
app.use(require('./middleware/error.middleware'));

// Initialize services
require('./services/init')().then(() => 

  // Start server
  app.listen(port, () => logger.log(`${name} (v${version}) started. Listening on port ${port}.`))
);
