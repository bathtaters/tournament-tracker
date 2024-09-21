const { matchedData }  = require('express-validator');

// Models
const event = require('../db/models/event');
const clock = require('../db/models/clock');
const match = require('../db/models/match');
const defs = require('../config/validation').defaults.event;

// Services/Utils
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

// Get clock data only
async function getClock(req, res) {
  const { id } = matchedData(req)
  if (!id) throw new Error("Missing event ID.")
  
  let data = await clock.get(id).then((data) => Array.isArray(data) ? data[0] : data)
  if (!data) throw new Error("Event not found")
  return res.sendAndLog(data)
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
  return event.add(eventData, req).then(res.sendAndLog);
}
async function removeEvent (req, res) {
  return event.rmv(matchedData(req).id, req).then(res.sendAndLog);
}

// Manually set event data (Guess day-slot if missing when updating day)
async function updateEvent (req, res) {
  let { id, ...body } = matchedData(req);

  if (body.players) body.playercount = body.players.length;
  if ('day' in body && !('slot' in body))
    body.slot = await event.getLastSlot(body.day, id).then(s => s + 1);
  
  return event.set(id, body, req).then(res.sendAndLog);
}

// Enable plan for all eventIds, disable plan for all missing eventIds
function setPlan(req, res) {
  const { events } = matchedData(req);
  return event.setPlan(events, req).then(res.sendAndLog);
}

// Clock operations -- run/pause/reset
const clockOp = (action) => {
  switch(action) {
    case "run": return (req, res) => {
      const { id } = matchedData(req)
      if (!id) throw new Error("Missing event ID.")
      return clock.run(id, req).then(res.sendAndLog).catch(catchClockError("run"))
    }
    case "reset": return (req, res) => {
      const { id } = matchedData(req)
      if (!id) throw new Error("Missing event ID.")
      return clock.reset(id, req).then(res.sendAndLog)
    }
    case "pause": return (req, res) => {
      const { id } = matchedData(req)
      if (!id) throw new Error("Missing event ID.")
      return clock.pause(id, req).then(res.sendAndLog).catch(catchClockError("pause"))
    }
    default: throw new Error(`Unrecognized clock action: ${action}`)
  }
}

module.exports = {
  getEvent, getAllEvents, getClock, setPlan,
  createEvent, removeEvent, updateEvent, clockOp,
};


// GetEvent HELPER - index rounds
const sortMatchResult = (result) => result && result.reduce((matchArr, row) => {
  matchArr[row.round - 1] = row.matches;
  return matchArr;
}, []);

// Clock catcher
const catchClockError = (action) => (err) => {
  if (err.message === "Event not found") {
    if (action === "run") throw new Error("Clock is already running or event not found")
    if (action === "pause") throw new Error("Clock is not running or event not found")
  }
  throw err
}