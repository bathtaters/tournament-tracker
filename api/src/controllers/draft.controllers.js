// Models
const draft = require('../db/models/draft');
const match = require('../db/models/match');
const defs = require('../config/validation').config.defaults.draft;

// Services/Utils
const { toBreakers } = require('../services/results');
const { arrToObj, matchListToArray } = require('../utils/utils');

/* GET draft database. */

// Specific draft
async function getDraft(req, res, next) {
  const draftData = await draft.getDraftDetail(req.params.id);
  if (!draftData || draftData.length === 0) throw new Error('Draft does not exist <'+ req.params.id+'>');

  const [drops, matches] = await Promise.all([
    draft.getDraftDrops(req.params.id),
    match.listByDraft(req.params.id).then(matchListToArray),
  ]);

  res.sendAndLog({ ...draftData, matches, drops });
}

// All drafts
async function getAllDrafts(_, res) {
  const drafts = await draft.get().then(arrToObj('id'));
  const matches = await match.listByDraft().then(matchListToArray);
  Object.keys(matches).forEach(d => {
    if (!drafts[d]) return logger.error('Match is missing draft',d);
    drafts[d].matches = matches[d];
  });

  res.sendAndLog(drafts);
}

// Breakers from draft
async function getBreakers(req, res) {
  const breakers = await draft.getBreakers(req.params.id);
  res.sendAndLog(breakers && toBreakers([breakers]));
}
async function getAllBreakers(_, res) {
  const breakers = await draft.getBreakers();
  res.sendAndLog(breakers && toBreakers([breakers]));
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