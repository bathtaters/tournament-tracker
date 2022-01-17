// Models
const draft = require('../db/models/draft');
const players = require('../db/models/player');

// Services
const db = require('../db/admin/interface');
const newRound = require('../services/newRound');

// Swap players in matches
const swapPlayers = (req, res) => players.swap(
  req.body.playerA.playerId,
  req.body.playerA.id,
  req.body.playerB.playerId,
  req.body.playerB.id
).then(res.sendAndLog);

// Create/Remove rounds
async function nextRound(req, res) {
  const data = await draft.getDraftReport(req.params.id);

  const [text, args] = newRound(data);
  const round = await db.query(text, args, true).then(r => r && r[0] && r[0].roundactive);

  return res.sendAndLog({ id: req.params.id, round });
}
async function prevRound(req, res) {
  const round = await draft.getDraftRound(req.params.id);
  if (round == null) throw new Error("No matches found.");

  await draft.popRound(req.params.id, round);

  return res.sendAndLog({ id: req.params.id, round });
}

module.exports = {
  swapPlayers, nextRound, prevRound,
};