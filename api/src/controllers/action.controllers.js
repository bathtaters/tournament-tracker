// Models
const draft = require('../db/models/draft');
const match = require('../db/models/match');

// Lookup Settings
const settings = require('../db/models/settings');
const { asType } = require('../services/settings.services');
const autoByesDef = require('../config/validation').config.defaults.settings.autobyes;

// Services
const roundService = require('../services/round.services');
const swapService = require('../services/swapPlayers.services');
const { arrToObj } = require('../utils/shared.utils');


// Swap players in matches
async function swapPlayers(req, res) {
  // Get data
  let matchData = await match.getMulti(
    req.body.swap.map(s => s.id), false,
    ['id', 'draftid','players','wins','drops']
  );

  // Error check
  if (matchData.length !== 2 || matchData.some(m => !m || !m.players))
    throw new Error("Matches not found or are invalid.");

  const draftId = matchData[0].draftid;
  if (draftId !== matchData[1].draftid)
    throw new Error("Cannot swap players from different drafts.");
  
  // Mutate match data
  matchData = swapService(matchData, req.body.swap);

  // Write changes
  const result = await match.updateMulti(matchData, 'draftid');
  if (!result || result.some(r => r.draftid !== draftId))
    throw new Error("Error writing swap to database.");

  return res.sendAndLog({ draftId });
} 


// Create round matches
async function nextRound(req, res) {
  const data = await draft.get(req.params.id, true);

  // Error check
  if (!data) throw new Error("Draft not found: "+req.params.id);

  if (
    !data.players ||
    !data.players.length ||
    (data.drops && data.drops.length >= data.players.length)
  )
    throw new Error("No active players are registered");

  if (data.roundactive > data.roundcount)
    throw new Error("Draft is over");

  if (data.roundactive && !data.canadvance)
    throw new Error("All matches have not been reported");

  // Get additional data
  const [matchData, oppData, autoByes] = await Promise.all([
    match.getByDraft(req.params.id),
    draft.getOpponents(req.params.id).then(arrToObj('playerid',{ valKey: 'oppids' })),
    settings.get('autobyes')
  ]);

  // Build round
  const { draftId, round, matches } = roundService(data, matchData, oppData, autoByes ? asType(autoByes) : autoByesDef);
  
  // Create matches
  const ret = await draft.pushRound(draftId, round, matches);
  if (!Array.isArray(ret) || !ret[0]) throw new Error("Error adding round to database");

  return res.sendAndLog({
    id: ret[0].id,
    round: ret[0].roundactive,
    matches: ret[1] && ret[1].map(m => m.id),
  });
}


// Delete round matches
async function prevRound(req, res) {
  const round = await draft.getRound(req.params.id); // Get latest round num
  if (round == null) throw new Error("No matches found.");

  await draft.popRound(req.params.id, round);

  return res.sendAndLog({ id: req.params.id, round });
}


module.exports = {
  swapPlayers, nextRound, prevRound,
};