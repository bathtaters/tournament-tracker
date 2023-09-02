const { matchedData }  = require('express-validator');

const planPlayers = require('../db/models/plan');
const { arrToObj } = require('../utils/shared.utils');

/* GET player database. */

// Individual player votes
const getVote = (req, res) => planPlayers.get(matchedData(req).id).then(res.sendAndLog);

// All player votes
const getAllVotes = (_, res) => planPlayers.get().then(arrToObj('id')).then(res.sendAndLog);


/* SET player database. */

// Add/Remove player to/from Plan
const addPlayer = (req, res) => planPlayers.add(matchedData(req).id).then(res.sendAndLog);
const removePlayer = (req, res) => planPlayers.rmv(matchedData(req).id).then(res.sendAndLog);

// Update player's vote
const updateVote = (req, res) => {
  const { id, ...body } = matchedData(req);
  return planPlayers.set(id, body).then(res.sendAndLog);
}


module.exports = { 
  getVote, getAllVotes,
  addPlayer, removePlayer, updateVote,
};