// Models
const draft = require('../db/models/draft');
const player = require('../db/models/player');
const match = require('../db/models/match');
const defs = require('../config/validation').config.defaults.draft;

// Services/Utils
const toBreakers = require('../services/breakers.services');
const { arrToObj } = require('../utils/shared.utils');

const ignoreUnfinishedDrafts = true;

/* GET draft database. */

// Specific draft
async function getDraft(req, res) {
  const draftData = await draft.get(req.params.id, true);
  if (!draftData || draftData.length === 0) throw new Error('Draft does not exist <'+ req.params.id+'>');

  const matches = await match.listByDraft(req.params.id).then(sortMatchResult);

  return res.sendAndLog({ ...draftData, matches });
}

// All drafts
const getAllDrafts = (_, res) => draft.get().then(arrToObj('id')).then(res.sendAndLog);

// Draft Stats
async function getBreakers(req, res) {
  const [matches, players, opps] = await Promise.all([
    match.getByDraft(req.params.id),
    draft.getPlayers(req.params.id).then(d => d.players),
    draft.getOpponents(req.params.id).then(arrToObj('playerid',{ valKey: 'oppids' })),
  ]);
  
  return res.sendAndLog(toBreakers(matches, players, opps, true));
}
async function getAllBreakers(_, res) {
  const [matches, players, opps] = await Promise.all([
    match.getAll(ignoreUnfinishedDrafts).then(matchesByDraft),
    player.list(),
    draft.getOpponents(null, ignoreUnfinishedDrafts).then(oppsByDraft),
  ]);
  
  return res.sendAndLog(toBreakers(matches, players, opps, false));
}


/* SET draft database. */

// Create/Remove draft
function createDraft (req, res) {
  const draftData = { ...defs, ...req.body };
  return draft.add(draftData).then(res.sendAndLog);
}
async function removeDraft (req, res) {
  return draft.rmv(req.params.id).then(res.sendAndLog);
}

// Manually set draft data
const updateDraft = (req, res) => draft.set(req.params.id, req.body).then(res.sendAndLog);


module.exports = {
  getDraft, getAllDrafts, 
  getBreakers, getAllBreakers, 
  createDraft, removeDraft, updateDraft,
};

// HELPER - index
const sortMatchResult = result => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);

// HELPERS - breakersGetAll - index opps/matches by draft
const oppsByDraft = opps => opps.reduce((obj,entry) => {
  if (!obj[entry.draftid]) obj[entry.draftid] = {};

  else if (obj[entry.draftid][entry.playerid])
    console.error('Duplicate player opponent objects:',entry,obj[entry.draftid][entry.playerid]);

  obj[entry.draftid][entry.playerid] = entry.oppids;
  return obj;
}, {});

const matchesByDraft = matches => matches.reduce((obj,entry) => {
  if (!obj[entry.draftid]) obj[entry.draftid] = [ entry ];
  else obj[entry.draftid].push(entry);
  return obj;
}, {});