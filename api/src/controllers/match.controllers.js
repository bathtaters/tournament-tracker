// Model
const matches = require('../db/models/match');
const defs = require('../config/validation').config.defaults.match;

// Imports
const { arrToObj } = require('../utils/shared.utils');

// Create empty report object
const emptyReport = {
    players: defs.players,
    draws: defs.draws,
    drops: defs.drops,
    reported: true,
};

/* GET match database. */
const getMatch = (req, res) => matches.get(req.params.matchId, true).then(res.sendAndLog);

const getAllMatches = (_, res) => matches.get().then(res.sendAndLog);

async function getDraftMatches(req, res) {
  const matchData = await matches.getByDraft(req.params.draftId).then(arrToObj('id', {delKey:0}));
  return res.sendAndLog(matchData || {});
}

/* SET match database. */

// Report match
//   { players: {playerId: winCount, ...} , draws: drawCount, drops: [droppedPlayers] }
async function reportMatch(req, res) {
  const ret = await matches.update(req.params.id, { ...emptyReport, ...req.body });
  return res.sendAndLog({ id: req.params.id, draftId: ret && ret.draftid, });
} 

// Clear report
async function unreportMatch(req, res) {
  // Get player names
  const match = await matches.get(req.params.id, false, 'players, draftId');
  if (!match) throw new Error("Match not found or invalid.");

  // Zero out & set report
  match.players && Object.keys(match.players).forEach(p => match.players[p] = 0);
  await matches.update(req.params.id, {
    ...emptyReport,
    players: match.players,
    reported: false
  });

  return res.sendAndLog({ id: req.params.id, draftId: match.draftid, });
}

// Update partial report data
async function updateMatch(req, res) {
  if (!req.body) throw new Error("No match data provided to update.");

  // Update players object
  let ret;
  if (req.body.players && Object.keys(req.body.players).length)
    ret = await matches.updatePlayer(req.params.id, req.body.players);
    
  // Update remaining data
  delete req.body.players;
  if (Object.keys(req.body).length)
    ret = await matches.update(req.params.id, req.body);
  
  // Return match & draft IDs
  return res.sendAndLog({ id: req.params.id, draftId: ret && ret.draftid, });
}


module.exports = {
  getMatch, getAllMatches, getDraftMatches,
  reportMatch, unreportMatch, updateMatch,
};