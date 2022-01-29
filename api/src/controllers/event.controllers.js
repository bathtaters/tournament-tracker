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
  if (!eventData || eventData.length === 0) throw new Error('Event does not exist <'+ req.params.id+'>');

  const matches = await match.listByEvent(req.params.id).then(sortMatchResult);

  return res.sendAndLog({ ...eventData, matches });
}

// All events
const getAllEvents = (_, res) => event.get().then(arrToObj('id')).then(res.sendAndLog);


/* SET event database. */

// Create/Remove event
function createEvent (req, res) {
  const eventData = { ...defs, ...req.body };
  return event.add(eventData).then(res.sendAndLog);
}
async function removeEvent (req, res) {
  return event.rmv(req.params.id).then(res.sendAndLog);
}

// Manually set event data
const updateEvent = (req, res) => event.set(req.params.id, req.body).then(res.sendAndLog);


module.exports = {
  getEvent, getAllEvents, 
  createEvent, removeEvent, updateEvent,
};


// GetEvent HELPER - index rounds
const sortMatchResult = result => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);
