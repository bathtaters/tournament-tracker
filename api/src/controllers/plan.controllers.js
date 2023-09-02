const planPlayers = require('../db/models/plan');
const { arrToObj } = require('../utils/shared.utils');

/* GET player database. */

// Individual player votes
const getVote = (req, res) => planPlayers.get(req.params.id).then(res.sendAndLog);

// All player votes
const getAllVotes = (_, res) => planPlayers.get().then(arrToObj('id')).then(res.sendAndLog);


/* SET player database. */

// Add/Remove player to/from Plan
const addPlayer = (req, res) => planPlayers.add(req.body.id).then(res.sendAndLog);
const removePlayer = (req, res) => planPlayers.rmv(req.params.id).then(res.sendAndLog);

// Update player's vote
const updateVote = (req, res) => planPlayers.set(req.params.id, req.body).then(res.sendAndLog);


module.exports = { 
  getVote, getAllVotes,
  addPlayer, removePlayer, updateVote,
};