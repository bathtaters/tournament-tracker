const matches = require('../db/models/match');


/* GET match database. */
const getMatch = (req, res) => matches.get(req.params.matchId, true).then(res.sendAndLog);
const getAllMatches = (_, res) => matches.get().then(res.sendAndLog);
const getDraftMatches = (req, res) => matches.getByDraft(req.params.draftId).then(res.sendAndLog);


/* SET match database. */

// Report match
const reportMatch   = (req, res) => matches.report(req.params.id, req.body).then(res.sendAndLog);
const unreportMatch = (req, res) => matches.unreport(        req.params.id).then(res.sendAndLog);
const updateMatch   = (req, res) => matches.update(req.params.id, req.body).then(res.sendAndLog);


module.exports = {
  getMatch, getAllMatches, getDraftMatches,
  reportMatch, unreportMatch, updateMatch,
};