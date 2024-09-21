const express = require('express');
const app = express();
const logger = require('./utils/log.adapter');
const { name, port, apiVersion: version, env } = require('./config/meta');

// Setup middleware
env === "production" && app.set('trust proxy', 1);
app.use(express.json());
app.use(require('./middleware/session.middleware'));
app.use(require('./middleware/log.middleware'));
app.use(require('./middleware/unescape.middleware'));

// Setup routes
app.use(`/api/v${version}`,         require('./routes/base.routes'));
app.use(`/api/v${version}/event`,   require('./routes/event.routes'));
app.use(`/api/v${version}/match`,   require('./routes/match.routes'));
app.use(`/api/v${version}/player`,  require('./routes/player.routes'));
app.use(`/api/v${version}/session`, require('./routes/session.routes'));
app.use(`/api/v${version}/voter`,   require('./routes/voter.routes'));
app.use(`/api/v${version}/plan`,    require('./routes/plan.routes'));
app.use('/api/version', (_, res) => res.sendAndLog({ version }));

// Error handling
app.use(() => { throw require('./config/constants').missingError; })
app.use(require('./middleware/error.middleware'));

// Initialize services
require('./services/init.services')().then(() => 

  // Start server
  app.listen(port, () => logger.log(`${name} (v${version}) started. Listening on port ${port}.`))
);
