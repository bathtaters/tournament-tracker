const { matchedData }  = require('express-validator');

const voters = require('../db/models/voter');
const { arrToObj } = require('../utils/shared.utils');

/* GET player database. */

// Individual player votes
const getVote = (req, res) => voters.get(matchedData(req).id).then(res.sendAndLog);

// All player votes
const getAllVotes = (_, res) => voters.get().then(arrToObj('id')).then(res.sendAndLog);


/* SET player database. */

// Add/Remove player as Voter
const addPlayer = (req, res) => voters.add(matchedData(req).id).then(res.sendAndLog);
const removePlayer = (req, res) => voters.rmv(matchedData(req).id).then(res.sendAndLog);

// Update player's vote
const updateVote = (req, res) => {
  const { id, ...body } = matchedData(req);
  return voters.set(id, body).then(res.sendAndLog);
}


module.exports = { 
  getVote, getAllVotes,
  addPlayer, removePlayer, updateVote,
};