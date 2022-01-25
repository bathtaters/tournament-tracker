const players = require('../db/models/player');
const { arrToObj, insertSorted } = require('../utils/shared.utils');

/* GET player database. */

// Individual player
const getPlayer = (req, res) => players.get(req.params.id).then(res.sendAndLog);

// All players
const getAllPlayers = (_, res) => players.get().then(arrToObj('id')).then(res.sendAndLog);

// Individual player draft details
const getPlayerDrafts = (req, res) => players.getPlayerDrafts(req.params.id)
  .then(drafts => drafts && drafts.map(d => d.id)).then(res.sendAndLog);


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