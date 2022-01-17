const players = require('../db/models/player');
const { arrToObj } = require('../utils/utils');

/* GET player database. */

// Individual player
async function getPlayer(req, res) {
  const playerData = await players.get(req.params.id);
  res.sendAndLog(playerData);
}

// All players
async function getAllPlayers(req, res) {
  const playerData = await players.get().then(arrToObj('id'));
  res.sendAndLog(playerData);
}

// Individual player draft details
async function getPlayerDrafts(req, res) {
  const playerDrafts = await players.getDrafts(req.params.id);
  res.sendAndLog(playerDrafts);
}


/* SET player database. */

// Create/remove player
const createPlayer = (req, res) => players.add(req.body).then(res.sendAndLog);
const removePlayer = (req, res) => players.rmv(req.params.id).then(res.sendAndLog);

// Rename
const updatePlayer = (req, res) => players.set(req.params.id, req.body).then(res.sendAndLog);


module.exports = { 
  getPlayer, getAllPlayers, getPlayerDrafts,
  createPlayer, removePlayer, updatePlayer,
};