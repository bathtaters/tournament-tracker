// Models
const event = require('../db/models/event');
const player = require('../db/models/player');
const match = require('../db/models/match');

// Services/Utils
const toStats = require('../services/stats.services');
const { arrToObj } = require('../utils/shared.utils');

// Get settings
const settings = require('../db/models/settings');
const { asType } = require('../services/settings.services');
const incompleteDef = require('../config/validation').defaults.settings.includeincomplete;



// Get Event Stats //

async function getAllStats(_, res) {
  const includeIncomplete = await settings.get('includeincomplete').then(r => r ? asType(r) : incompleteDef);
  const [matches, players, opps] = await Promise.all([
    match.getAll(!includeIncomplete).then(matchesByEvent),
    player.list(),
    event.getOpponents(null, !includeIncomplete).then(oppsByEvent),
  ]);
  
  return res.sendAndLog(toStats(matches, players, opps, false));
}

async function getStats(req, res) {
  const [matches, players, opps] = await Promise.all([
    match.getByEvent(req.params.id),
    event.getPlayers(req.params.id).then(d => d.players),
    event.getOpponents(req.params.id)
      .then(arrToObj('playerid',{ valKey: 'oppids' })),
  ]);
  
  return res.sendAndLog(toStats({solo: matches}, players, {solo: opps}, true));
}


module.exports = { getAllStats, getStats }



// HELPERS - statsGetAll - index opps/matches by event
const oppsByEvent = opps => opps.reduce((obj,entry) => {
  if (!obj[entry.eventid]) obj[entry.eventid] = {};

  else if (obj[entry.eventid][entry.playerid])
    logger.error('Duplicate player opponent objects:',entry,obj[entry.eventid][entry.playerid]);

  obj[entry.eventid][entry.playerid] = entry.oppids;
  return obj;
}, {});

const matchesByEvent = matches => matches && matches.reduce((obj,entry) => {
  if (!obj[entry.eventid]) obj[entry.eventid] = [ entry ];
  else obj[entry.eventid].push(entry);
  return obj;
}, {});