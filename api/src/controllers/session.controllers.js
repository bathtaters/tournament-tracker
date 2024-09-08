const { matchedData }  = require('express-validator');

const players = require('../db/models/player');

// Player login
async function login(req, res, next) {
    const { name, password } = matchedData(req);
    req.session.user = null;
    if (!password) return next({ status: 403, message: 'Missing password.' });
    
    const user = await players.getUser(name)
    const message = await players.checkPassword(name, password, user);
    if (message || !user) return next({ status: 403, message });

    await players.startSession(name, user.id, req.sessionID);
    req.session.user = user.id;
    return res.sendAndLog({ session: req.sessionID });
}


// Player logout
async function logout(req, res, next) {
    if (!req.session.user) return next({ status: 400, message: 'User is not logged in.' });

    const ret = await players.endSession(req.session.user, req.sessionID);
    req.session.user = null;
    return res.sendAndLog({ success: !!ret?.id });
}


// Fetch player data by session cookie
async function player(req, res, next) {
    const player = await players.sessionPlayer(req.sessionID);
    req.session.user = player?.id;
    return player ? res.sendAndLog(player) : next({ status: 204, message: 'Player not found' });
}


// Fetch session cookie
async function fetch(req, res, next) {
    if (!req.sessionID) return next({ status: 500, message: 'Server failed to start a session.' });
    return next();
}


// Check if user can reset password
const resetStatus = async (req, res) => {
    const { id, session } = matchedData(req);
    const db = await players.hasPass(id);
    if (!db?.id) return res.sendAndLog({ error: 'id' });
    if (db.session !== session) return res.sendAndLog({ error: 'session' });
    return res.sendAndLog({ valid: true, isSet: !!db.password });
}
  

module.exports = { login, logout, player, fetch, resetStatus };