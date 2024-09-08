const { matchedData }  = require('express-validator');

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
  const matchData = await match.getByEvent(matchedData(req).eventid).then(arrToObj('id', {delKey:0}));
  matchData && Object.values(matchData).forEach(m => m.isDraw = m.wins.filter(w => w == m.maxwins).length !== 1);
  return res.sendAndLog(matchData || {});
}

/* SET match database. */

// Report match
//   { players: {playerid: wincount, ...} , draws: drawCount, drops: [droppedPlayers] }
async function reportMatch(req, res) {
  const { id, ...body } = matchedData(req);
  const ret = await match.update(id, { ...emptyReport, ...body }, req.session.user || req.sessionID);
  return res.sendAndLog({ id, eventid: ret && ret.eventid, });
} 

// Clear report
async function unreportMatch(req, res) {
  // Get player names
  const { id } = matchedData(req);
  const matches = await match.get(id, false, 'players, eventid');
  if (!matches) throw new Error("Match not found or invalid.");

  // zero out wins, set reported
  await match.update(id, {
  ...emptyReport,
    wins: (matches.players || []).map(() => 0),
    reported: false
  }, req.session.user || req.sessionID);

  return res.sendAndLog({ id, eventid: matches.eventid, });
}

// Update partial report data
async function updateMatch(req, res) {
  const { id, ...body } = matchedData(req);
  
  if (!body.key || !('value' in body)) throw new Error("No match data provided to update.");

  // Update wins array
  let ret;
  const idx = body.key.match(/^wins\.(\d+)$/);
  if (idx) ret = await match.updateWins(id, +idx[1], body.value, req.session.user || req.sessionID);
    
  // Update other data
  else ret = await match.update(id, { [body.key]: body.value }, req.session.user || req.sessionID);
  
  // Return match & event IDs
  return res.sendAndLog({ id, eventid: ret?.eventid, });
}

// Drop/Undrop Player
async function updateDrops(req, res) {
  const { id, playerid, undrop } = matchedData(req);

  if (!playerid) throw new Error("Not enough data provided to drop/undrop player.");

  // Add/Remove player to drop
  const ret = await match.dropPlayer(id, playerid, !undrop, req.session.user || req.sessionID)
  
  // Return match & event IDs
  return res.sendAndLog({ id, eventid: ret?.eventid });
}


module.exports = {
  getAllMatches, getEventMatches,
  reportMatch, unreportMatch,
  updateMatch, updateDrops,
};