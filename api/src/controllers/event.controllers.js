const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const match = require('../db/models/match');
const defs = require('../config/validation').defaults.event;

// Services/Utils
const logger = require('../utils/log.adapter');
const { arrToObj } = require('../utils/shared.utils');


/* GET event database. */

// Specific event
async function getEvent(req, res) {
  const { id } = matchedData(req);
  const eventData = await event.get(id, true);
  if (!eventData || eventData.length === 0) return res.sendStatus(204);

  const matches = await match.listByEvent(id).then(sortMatchResult);

  return res.sendAndLog({ ...eventData, matches });
}

// All events
const getAllEvents = (_, res) => event.get().then(arrToObj('id',{delKey:0})).then(res.sendAndLog);


/* SET event database. */

// Create/Remove event
async function createEvent (req, res) {
  const slot = await event.getLastSlot(null).then(s => s + 1);

  let body = matchedData(req);
  if (body.players) body.playercount = body.players.length;

  const eventData = { ...defs, ...body, slot };
  return event.add(eventData).then(res.sendAndLog);
}
async function removeEvent (req, res) {
  return event.rmv(matchedData(req).id).then(res.sendAndLog);
}

// Manually set event data (Guess day-slot if missing when updating day)
async function updateEvent (req, res) {
  let { id, ...body } = matchedData(req);
  if (!('day' in body) && req.body.day === null) body.day = null

  if (body.players) body.playercount = body.players.length;
  if ('day' in body && !('slot' in body))
    body.slot = await event.getLastSlot(body.day, id).then(s => s + 1);
  
  return event.set(id, body).then(res.sendAndLog);
}

// Enable plan for all eventIds, disable plan for all missing eventIds
function setPlan(req, res) {
  const { events } = matchedData(req);
  return event.setPlan(events).then(res.sendAndLog);
}

module.exports = {
  getEvent, getAllEvents, setPlan,
  createEvent, removeEvent, updateEvent,
};


// GetEvent HELPER - index rounds
const sortMatchResult = (result) => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);
