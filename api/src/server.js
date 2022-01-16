const express = require('express');
const app = express();
const port = process.env.PORT || 9090;
const version = (require('../package.json').version || '1').split('.',1)[0];

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

app.listen(port, () => console.log(`lol-retreat api (v${version}) started. Listening on port ${port}.`));
