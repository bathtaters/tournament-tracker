// Models
const draft = require('../db/models/draft');
const match = require('../db/models/match');
const defs = require('../config/validation').config.defaults.draft;

// Services/Utils
const logger = require('../utils/log.adapter');
const { arrToObj } = require('../utils/shared.utils');


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
  createDraft, removeDraft, updateDraft,
};


// GetDraft HELPER - index rounds
const sortMatchResult = result => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);
