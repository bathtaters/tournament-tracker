const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const player = require('../db/models/player');
const match = require('../db/models/match');

// Services/Utils
const toStats = require('../services/stats.services');
const { arrToObj } = require('../utils/shared.utils');



// Get Event Stats //

async function getAllStats(_, res) {
  const [matches, players, opps] = await Promise.all([
    match.getAll(true).then(matchesByEvent),
    player.list(),
    event.getOpponents(null, true).then(oppsByEvent),
  ]);

  return withMissingEventIds(toStats(matches, players, opps, false)).then(res.sendAndLog);
}

async function getStats(req, res) {
  const { id } = matchedData(req);
  const players = await event.getPlayers(id);
  if (!players) return res.sendStatus(204);

  const [matches, opps] = await Promise.all([
    match.getByEvent(id),
    event.getOpponents(id).then(arrToObj('playerid',{ valKey: 'oppids' })),
  ]);
  
  return res.sendAndLog(toStats({[id]: matches}, players.players, {[id]: opps}, true));
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

async function withMissingEventIds(stats) {
  if (!stats?.ranking) return stats

  // Collect missing ids
  const playerids = stats.ranking.filter(pid => !(pid in stats))
  if (!playerids.length) return stats

  // Get missing player events
  const playerEvents = await player.getPlayerEvents(playerids);
  if (!playerEvents) return stats

  // Create stats entries for missing players
  playerEvents.forEach((playerData, idx) => {
    if (!playerData?.length || !playerids[idx]) return;
    stats[playerids[idx]] = { eventids: playerData.map(d => d.id) }
  })

  return stats
}