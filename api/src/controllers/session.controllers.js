const { matchedData }  = require('express-validator');

const players = require('../db/models/player');

// Player login
async function login(req, res, next) {
    const { name, password } = matchedData(req);
    if (!password) return next({ status: 403, message: 'Missing password.' });
    
    const message = await players.checkPassword(name, password);
    if (message) return next({ status: 403, message })

    const session = await players.startSession(name);
    return res.sendAndLog({ session });
}


// Player logout
async function logout(req, res, next) {
    const { session } = matchedData(req);
    if (!session) return next({ status: 400, message: 'Missing session ID.' });

    const ret = await players.endSession(session);
    return res.sendAndLog({ success: !!ret?.id });
}


// Fetch player data by session cookie
async function fetch(req, res, next) {
    const { session } = matchedData(req);
    if (!session) return next({ status: 400, message: 'Missing session ID.' });

    const player = await players.fetchSession(session);
    return player ? res.sendAndLog(player) : next({ status: 204 });
}


module.exports = { login, logout, fetch };