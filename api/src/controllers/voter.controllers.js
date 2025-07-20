const { matchedData } = require("express-validator");
const voter = require("../db/models/voter");
const { arrToObj, toDateStr } = require("../utils/shared.utils");

/* GET player database. */

// Individual player votes
const getVote = (req, res) =>
  voter.get(matchedData(req).id).then(toDateStr).then(res.sendAndLog);

// All player votes
const getAllVotes = (_, res) =>
  voter.get().then(arrToObj("id")).then(toDateStr).then(res.sendAndLog);

/* SET player database. */

// Add/Remove player as Voter
const setVoters = async (req, res) => {
  const { voters } = matchedData(req);

  const rmv = await voter.rmvOther(voters, req);
  const add = await voter.upsert(voters, req);

  res.sendAndLog([...add, ...rmv]);
};

// Update player's vote
const updateVote = (req, res) => {
  const { id, ...body } = matchedData(req);
  return voter.set(id, body, req).then(res.sendAndLog);
};

module.exports = {
  getVote,
  getAllVotes,
  setVoters,
  updateVote,
};
