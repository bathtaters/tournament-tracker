const { matchedData }  = require('express-validator');

const voter = require('../db/models/voter');
const { arrToObj, toDateStr } = require('../utils/shared.utils');

/* GET player database. */

// Individual player votes
const getVote = (req, res) => voter.get(matchedData(req).id).then(toDateStr).then(res.sendAndLog);

// All player votes
const getAllVotes = (_, res) => voter.get().then(arrToObj('id')).then(toDateStr).then(res.sendAndLog);


/* SET player database. */

// Add/Remove player as Voter
const setVoters = async (req, res) => {
  const { voters } = matchedData(req);
  
  const rmv = await voter.rmvOther(voters);
  const add = await voter.add(voters);
  
  res.sendAndLog([ ...add, ...rmv ]);
}

// Update player's vote
const updateVote = (req, res) => {
  const { id, ...body } = matchedData(req);
  return voter.set(id, body).then(res.sendAndLog);
}

// Remove all voters/planned events and settings
const resetPlan = (_, res) => voter.reset().then(() => res.sendAndLog({ success: true }));


module.exports = { 
  getVote, getAllVotes,
  setVoters, updateVote,
  resetPlan,
};