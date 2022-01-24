// Models
const draft = require('../db/models/draft');
const players = require('../db/models/player');

// Services
const db = require('../db/admin/interface');
const roundService = require('../services/round.services');


// Swap players in matches
async function swapPlayers(req, res) {
  let draftId;

  if (!req.body.playerB.playerId)
    draftId = await players.popPlayer(
      req.body.playerA.playerId,
      req.body.playerA.id
    );

  else
    draftId = await players.swapPlayers(
      req.body.playerA.playerId,
      req.body.playerA.id,
      req.body.playerB.playerId,
      req.body.playerB.id || req.body.playerA.id
    ).then(r => r[0]);
  
  draftId = draftId && draftId[0] && draftId[0].draftid;
  if (!draftId) throw new Error("Cannot find match/player(s).");
  return res.sendAndLog({ draftId });
} 


// Create round matches
async function nextRound(req, res) {
  const data = await draft.getDraftReport(req.params.id);

  // Error check
  if (!data) throw new Error("Draft not found: "+req.params.id);

  if (
    !data.draftData.players ||
    !data.draftData.players.length ||
    (data.drops && data.drops.length >= data.draftData.players.length)
  )
    throw new Error("No active players are registered");

  if (data.draftData.roundactive > data.draftData.roundcount)
    throw new Error("Draft is over");

  if (data.draftData.roundactive && !data.draftData.canadvance)
    throw new Error("All matches have not been reported");

  // Build round
  const { draftId, round, matches } = roundService(data, true);
  // if (!draftId || round == null) throw new Error("Error determining current round");
  
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
  const round = await draft.getDraftRound(req.params.id);
  if (round == null) throw new Error("No matches found.");

  await draft.popRound(req.params.id, round);

  return res.sendAndLog({ id: req.params.id, round });
}


module.exports = {
  swapPlayers, nextRound, prevRound,
};