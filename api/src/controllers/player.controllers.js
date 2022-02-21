const players = require('../db/models/player');
const { arrToObj } = require('../utils/shared.utils');

/* GET player database. */

// Individual player
const getPlayer = (req, res) => players.get(req.params.id).then(res.sendAndLog);

// All players
const getAllPlayers = (_, res) => players.get().then(arrToObj('id')).then(res.sendAndLog);

// Individual player event details
const getPlayerEvents = (req, res) => players.getPlayerEvents(req.params.id)
.then(events => events && events.map(d => d.id)).then(res.sendAndLog);

// Individual player match details
async function getPlayerMatches(req, res) {
  const matchData = await players.getPlayerMatches(req.params.playerid);
  matchData && matchData.forEach(m => m.isDraw = m.wins.filter(w => w == m.maxwins).length !== 1);
  return res.sendAndLog(arrToObj('eventid', {delKey:0, combo:1})(matchData || {}));
}


/* SET player database. */

// Create/remove player
const createPlayer = (req, res) => players.add(req.body).then(res.sendAndLog);
const removePlayer = (req, res) => players.rmv(req.params.id).then(res.sendAndLog);

// Rename
const updatePlayer = (req, res) => players.set(req.params.id, req.body).then(res.sendAndLog);


module.exports = { 
  getPlayer, getAllPlayers, getPlayerEvents, getPlayerMatches,
  createPlayer, removePlayer, updatePlayer,
};