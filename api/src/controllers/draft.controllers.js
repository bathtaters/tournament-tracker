// Models
const draft = require('../db/models/draft');
const player = require('../db/models/player');
const match = require('../db/models/match');
const defs = require('../config/validation').config.defaults.draft;

// Services/Utils
const toBreakers = require('../services/breakers.services');
const { arrToObj } = require('../utils/shared.utils');

/* GET draft database. */

// HELPER: Convert array of match object to 2D array using round as index
const matchListToRoundArray = matches => matches && matches.reduce((arr,round) => {
  arr[round.round - 1] = round.matches;
  return arr;
}, []);


// Specific draft
async function getDraft(req, res, next) {
  const draftData = await draft.getDraft(req.params.id, true);
  if (!draftData || draftData.length === 0) throw new Error('Draft does not exist <'+ req.params.id+'>');

  const [drops, matches] = await Promise.all([
    draft.getDraftDrops(req.params.id),
    match.listByDraft(req.params.id).then(matchListToRoundArray),
  ]);

  res.sendAndLog({ ...draftData, matches, drops });
}

// All drafts
async function getAllDrafts(_, res) {
  const drafts = await draft.get().then(arrToObj('id'));
  const matches = await match.listByDraft().then(matchListToRoundArray);
  Object.keys(matches).forEach(d => {
    if (!drafts[d]) return logger.error('Match is missing draft',d);
    drafts[d].matches = matches[d];
  });

  res.sendAndLog(drafts);
}

// Draft Stats
async function getBreakers(req, res) {
  const [players,breakers] = await Promise.all([
    draft.getDraft(req.params.id).then(r => r && r.players),
    draft.getBreakers(req.params.id),
  ]);
  
  res.sendAndLog(breakers && toBreakers(breakers, players, true));
}
async function getAllBreakers(_, res) {
  const [players,breakers] = await Promise.all([
    player.get().then(r => r && r.map(p => p.id)),
    draft.getBreakers(null, true),
  ]);

  res.sendAndLog(breakers && toBreakers(breakers, players, false));
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