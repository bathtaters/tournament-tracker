// Models
const draft = require('../db/models/draft');
const player = require('../db/models/player');
const match = require('../db/models/match');

// Services/Utils
const toStats = require('../services/stats.services');
const { arrToObj } = require('../utils/shared.utils');

// CONFIG
const ignoreUnfinishedDrafts = true;


// Get Draft Stats //

async function getAllStats(_, res) {
  const [matches, players, opps] = await Promise.all([
    match.getAll(ignoreUnfinishedDrafts).then(matchesByDraft),
    player.list(),
    draft.getOpponents(null, ignoreUnfinishedDrafts).then(oppsByDraft),
  ]);
  
  return res.sendAndLog(toStats(matches, players, opps, false));
}

async function getStats(req, res) {
  const [matches, players, opps] = await Promise.all([
    match.getByDraft(req.params.id),
    draft.getPlayers(req.params.id).then(d => d.players),
    draft.getOpponents(req.params.id)
      .then(arrToObj('playerid',{ valKey: 'oppids' })),
  ]);
  
  return res.sendAndLog(toStats({solo: matches}, players, {solo: opps}, true));
}


module.exports = { getAllStats, getStats }



// HELPERS - statsGetAll - index opps/matches by draft
const oppsByDraft = opps => opps.reduce((obj,entry) => {
  if (!obj[entry.draftid]) obj[entry.draftid] = {};

  else if (obj[entry.draftid][entry.playerid])
    logger.error('Duplicate player opponent objects:',entry,obj[entry.draftid][entry.playerid]);

  obj[entry.draftid][entry.playerid] = entry.oppids;
  return obj;
}, {});

const matchesByDraft = matches => matches && matches.reduce((obj,entry) => {
  if (!obj[entry.draftid]) obj[entry.draftid] = [ entry ];
  else obj[entry.draftid].push(entry);
  return obj;
}, {});