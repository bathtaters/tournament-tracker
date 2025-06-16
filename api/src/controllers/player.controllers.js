const { matchedData }  = require('express-validator');

const players = require('../db/models/player');
const { encryptPassword } = require('../utils/session.utils');
const { arrToObj } = require('../utils/shared.utils');
const { lastAdminError } = require('../config/constants');

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
const removePlayer = async (req, res, next) => {
  const { id } = matchedData(req);
  const isLast = await players.isLastAdmin(id)
  if (isLast) return next(lastAdminError)
  return players.rmv(id, req).then(res.sendAndLog);
}

const createPlayer = async (req, res, next) => {
  const { password, ...body } = matchedData(req)
  const user = await players.add(body, req)
  if (!user.id) return next('Player creation failed.')

  if (password) {
    // Hash password with new User ID & update
    const hashed = await encryptPassword(password, user.id)
    await players.set(user.id, { password: hashed }, req)
  }
  return res.sendAndLog(user)
};

// Update player
const updatePlayer = async (req, res) => {
  const { id, ...body } = matchedData(req);
  if (req.body.session === null) body.session = null;
  if (body.password) body.password = await encryptPassword(body.password, id);
  return players.set(id, body, req).then(res.sendAndLog);
}

// Reset Session
const resetPassword = async (req, res) => {
  const { id } = matchedData(req);
  const session = await players.resetLogin(id, req);
  return res.sendAndLog({ session });
}


module.exports = { 
  getPlayer, getAllPlayers, getPlayerEvents, getPlayerMatches,
  createPlayer, removePlayer, updatePlayer, resetPassword,
};