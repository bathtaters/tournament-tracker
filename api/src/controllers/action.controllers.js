const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const match = require('../db/models/match');

// Lookup Settings
const settings = require('../db/models/settings');
const { asType } = require('../services/settings.services');
const autoByesDef = require('../config/validation').defaults.settings.autobyes;

// Services
const roundService = require('../services/round.services');
const { swapPlayersService, getUniqueIds } = require('../services/swapPlayers.services');
const { arrToObj } = require('../utils/shared.utils');


// Swap players in matches
async function swapPlayers(req, res) {
  // Get data
  const { swap } = matchedData(req);
  let matchData = await match.getMulti(
    getUniqueIds(swap, 'id'), false,
    ['id', 'eventid','players','wins','drops','reported']
  );

  // Error check
  if (!matchData?.length || matchData.some(m => !m || !m.players))
    throw new Error("Matches not found or are invalid.");
  
  const eventid = matchData[0].eventid;
  if (matchData.some(m => eventid !== m.eventid))
    throw new Error("Cannot swap players from different events.");
  
  // Mutate match data
  matchData = swapPlayersService(matchData, swap);

  // Write changes
  const result = await match.updateMulti(matchData, 'eventid');
  if (!result || result.some(r => r.eventid !== eventid))
    throw new Error("Error writing swap to database.");

  return res.sendAndLog({ eventid });
} 


// Create round matches
async function nextRound(req, res) {
  const { id, roundactive } = matchedData(req);
  const data = await event.get(id, true);

  // Error check
  if (!data) throw new Error("Event not found: "+id);

  if (data.roundactive + 1 !== roundactive)
    throw new Error("Recieved too many round change requests.");

  if (
    !data.players ||
    !data.players.length ||
    (data.drops && data.drops.length >= data.players.length)
  )
    throw new Error("No active players are registered");

  if (data.roundactive > data.roundcount)
    throw new Error("Event is over");

  if (data.roundactive && !data.allreported)
    throw new Error("All matches have not been reported");

  // Get additional data
  const [matchData, oppData, autoByes] = await Promise.all([
    match.getByEvent(id),
    event.getOpponents(id).then(arrToObj('playerid',{ valKey: 'oppids' })),
    settings.get('autobyes')
  ]);

  // Build round
  const { eventid, round, matches } = roundService(data, matchData, oppData, autoByes ? asType(autoByes) : autoByesDef);
  
  // Create matches
  const ret = await event.pushRound(eventid, round, matches);
  if (!Array.isArray(ret) || !ret[0]) throw new Error("Error adding round to database");

  return res.sendAndLog({
    id: ret[0].id,
    round: ret[0].roundactive,
    matches: ret[1] && ret[1].map(m => m.id),
  });
}


// Delete round matches
async function prevRound(req, res) {
  const { id, roundactive } = matchedData(req);
  
  const round = await event.getRound(id); // Get latest round num
  if (round == null) throw new Error("No matches found.");

  if (round !== roundactive)
    throw new Error("Recieved too many round change requests.");

  await event.popRound(id, round);

  return res.sendAndLog({ id: id, round });
}


module.exports = {
  swapPlayers, nextRound, prevRound,
};