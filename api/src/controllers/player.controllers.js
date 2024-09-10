const { matchedData }  = require('express-validator');

const players = require('../db/models/player');
const { encryptPassword } = require('../utils/session.utils');
const { arrToObj } = require('../utils/shared.utils');

/* GET player database. */

// Individual player
const getPlayer = (req, res) => players.get(matchedData(req).id).then(res.sendAndLog);

// All players
const getAllPlayers = (_, res) => players.get().then(arrToObj('id')).then(res.sendAndLog);

// Individual player event details
const getPlayerEvents = (req, res) => players.getPlayerEvents([matchedData(req).id])
  .then(events => events?.map(d => d.id)).then(res.sendAndLog);

// Individual player match details
async function getPlayerMatches(req, res) {
  const matchData = await players.getPlayerMatches(matchedData(req).playerid);
  matchData && matchData.forEach(m => m.isDraw = m.wins.filter(w => w == m.maxwins).length !== 1);
  return res.sendAndLog(arrToObj('eventid', {delKey:0, combo:1})(matchData || {}));
}


/* SET player database. */

// Create/remove player
const createPlayer = (req, res) => players.add(matchedData(req), req.session.user).then(res.sendAndLog);
const removePlayer = (req, res) => players.rmv(matchedData(req).id, req.session.user || matchedData(req).id).then(res.sendAndLog);

// Rename
const updatePlayer = async (req, res) => {
  const { id, ...body } = matchedData(req);
  if (req.body.session === null) body.session = null;
  if (body.password) body.password = await encryptPassword(body.password);
  return players.set(id, body, req.session.user || id).then(res.sendAndLog);
}

// Reset Session
const resetPassword = async (req, res) => {
  const { id } = matchedData(req);
  const session = await players.resetLogin(id, req.session.user || id);
  return res.sendAndLog({ session });
}


module.exports = { 
  getPlayer, getAllPlayers, getPlayerEvents, getPlayerMatches,
  createPlayer, removePlayer, updatePlayer, resetPassword,
};