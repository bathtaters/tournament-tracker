const players = require('../db/models/player');
const { arrToObj, insertInOrder } = require('../utils/utils');

/* GET player database. */

// Individual player
const getPlayer = (req, res) => players.get(req.params.id)
  .then(res.sendAndLog);

// All players
const getAllPlayers = (req, res) => players.get().then(arrToObj('id'))
  .then(res.sendAndLog);

// Individual player draft details
async function getPlayerDrafts(req, res) {
  const drafts = await players.getPlayerDrafts(req.params.id);
  if (!drafts) return drafts;

  // Get player match data
  let ret = drafts[1] || [];

  // Append drafts w/o match data (Sorted by day)
  drafts[0] && drafts[0].forEach(a => { 
      if (!ret.some(b => a.id === b.id))
        ret = insertInOrder(ret, a, {asc:0, key:'day'});
  });
  return res.sendAndLog(ret);
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