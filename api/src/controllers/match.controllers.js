// Model
const match = require('../db/models/match');
const defs = require('../config/validation').defaults.match;

// Imports
const { arrToObj } = require('../utils/shared.utils');

// Create empty report object
const emptyReport = {
    wins: defs.wins,
    draws: defs.draws,
    drops: defs.drops,
    reported: true,
};

/* GET match database. */
const getAllMatches = (_, res) => match.get().then(res.sendAndLog);

async function getEventMatches(req, res) {
  const matchData = await match.getByEvent(req.params.eventId).then(arrToObj('id', {delKey:0}));
  matchData && Object.values(matchData).forEach(m => m.isDraw = m.wins.filter(w => w == m.maxwins).length !== 1);
  return res.sendAndLog(matchData || {});
}

/* SET match database. */

// Report match
//   { players: {playerId: winCount, ...} , draws: drawCount, drops: [droppedPlayers] }
async function reportMatch(req, res) {
  const ret = await match.update(req.params.id, { ...emptyReport, ...req.body });
  return res.sendAndLog({ id: req.params.id, eventId: ret && ret.eventid, });
} 

// Clear report
async function unreportMatch(req, res) {
  // Get player names
  const matches = await match.get(req.params.id, false, 'players, eventId');
  if (!matches) throw new Error("Match not found or invalid.");

  // zero out wins, set reported
  await match.update(req.params.id, {
    ...emptyReport,
    wins: (matches.wins || []).map(() => 0),
    reported: false
  });

  return res.sendAndLog({ id: req.params.id, eventId: matches.eventid, });
}

// Update partial report data
async function updateMatch(req, res) {
  if (!req.body || !req.body.key || !('value' in req.body))
    throw new Error("No match data provided to update.");

  // Update wins array
  let ret;
  const idx = req.body.key.match(/^wins\.(\d+)$/);
  if (idx) ret = await match.updateWins(req.params.id, +idx[1], req.body.value);
    
  // Update other data
  else ret = await match.update(req.params.id, { [req.body.key]: req.body.value });
  
  // Return match & event IDs
  return res.sendAndLog({ id: req.params.id, eventId: ret && ret.eventid, });
}


module.exports = {
  getAllMatches, getEventMatches,
  reportMatch, unreportMatch, updateMatch,
};