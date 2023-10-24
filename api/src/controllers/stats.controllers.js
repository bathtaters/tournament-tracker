const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const player = require('../db/models/player');
const match = require('../db/models/match');

// Services/Utils
const toStats = require('../services/stats.services');
const { arrToObj } = require('../utils/shared.utils');
const { creditsPerRank, didntPlayCredits } = require('../config/constants');



// Get Event Stats //

async function getAllStats(_, res) {
  const matches = await match.getAll(true).then(matchesByEvent);
  const players = await player.list();
  const opps    = await event.getOpponents(null, true).then(oppsByEvent);

  return withMissingEventIds(toStats(matches, players, opps, false)).then(res.sendAndLog);
}

async function getStats(req, res) {
  const { id } = matchedData(req);
  const players = await event.getPlayers(id).then((r) => r?.players);
  if (!players) return res.sendStatus(204);

  const [matches, opps] = await Promise.all([
    match.getByEvent(id),
    event.getOpponents(id).then(arrToObj('playerid',{ valKey: 'oppids' })),
  ]);
  
  return res.sendAndLog(toStats({[id]: matches}, players, {[id]: opps}, true));
}

const getEventCredits = (id, matches, players, opps, credits = {}) => {
  const { ranking } = toStats({[id]: matches}, players, {[id]: opps}, true)
  if (!ranking?.length) return credits
  
  players.forEach((player) => {
    if (!credits[player]) credits[player] = 0

    credits[player] += 
      ranking.includes(player) ? 
        creditsPerRank[ranking.indexOf(player)]
        : didntPlayCredits
  })

  return credits
}

const resetAllCredits = (includeFinished = false) => includeFinished ?
  async function resetAllCredits() {
    let credits = {}
    const players = await player.list()

    for (const id of players) {
      credits[id] = 0
      await player.set(id, { credits: 0 })
    }
    return res.sendAndLog(credits)
  } :
  async function resetAllCredits(_, res) {
    const matches = await match.getAll(true).then(matchesByEvent);
    const players = await player.list();
    const opps    = await event.getOpponents(null, true).then(oppsByEvent);

    let credits = {}

    for (const id in matches) {
      getEventCredits(id, matches[id], players, opps[id], credits)
    }
    
    for (const id in credits) {
      await player.set(id, { credits: credits[id] })
    }
    return res.sendAndLog(credits)
  }

const setCredits = (undo = false) =>
  async function setCredits(req, res) {
    const { id } = matchedData(req);
    const players = await event.getPlayers(id).then((r) => r?.players);
    if (!players) return res.sendStatus(204);

    const [allPlayers, matches, opps] = await Promise.all([
      player.get(),
      match.getByEvent(id),
      event.getOpponents(id).then(arrToObj('playerid',{ valKey: 'oppids' })),
    ]);

    let eventCredits = getEventCredits(id, matches, players, opps)
  
  for (const { id, credits } of allPlayers) {
    if (!(id in eventCredits)) eventCredits[id] = didntPlayCredits
    await player.set(id, { credits: credits + (undo ? -eventCredits[id] : eventCredits[id]) })
  }
  return res.sendAndLog(eventCredits)
}


module.exports = { getAllStats, getStats, resetAllCredits, setCredits }



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