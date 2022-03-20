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
  const eventData = await event.get(req.params.id, true);
  if (!eventData || eventData.length === 0) return res.sendStatus(204);

  const matches = await match.listByEvent(req.params.id).then(sortMatchResult);

  return res.sendAndLog({ ...eventData, matches });
}

// All events
const getAllEvents = (_, res) => event.get().then(arrToObj('id',{delKey:0})).then(res.sendAndLog);


/* SET event database. */

// Create/Remove event
async function createEvent (req, res) {
  const slot = await event.getLastSlot(null).then(s => s + 1);
  const eventData = { ...defs, ...req.body, slot };
  return event.add(eventData).then(res.sendAndLog);
}
async function removeEvent (req, res) {
  return event.rmv(req.params.id).then(res.sendAndLog);
}

// Manually set event data (Guess day-slot if missing when updating day)
async function updateEvent (req, res) {
  if ('day' in req.body && !('slot' in req.body))
    req.body.slot = await event.getLastSlot(req.body.day, req.params.id).then(s => s + 1);
  return event.set(req.params.id, req.body).then(res.sendAndLog);
}


module.exports = {
  getEvent, getAllEvents, 
  createEvent, removeEvent, updateEvent,
};


// GetEvent HELPER - index rounds
const sortMatchResult = (result) => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);
