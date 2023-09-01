const players = require('../db/models/player');

// Player login
async function login(req, res, next) {
    if (!req.body.password) return next({ status: 403, message: 'Missing password.' });
    
    const message = await players.checkPassword(req.body.name, req.body.password);
    if (message) return next({ status: 403, message })

    const session = await players.startSession(req.body.name);
    return res.sendAndLog({ session });
}


// Player logout
async function logout(req, res, next) {
    if (!req.body.session) return next({ status: 400, message: 'Missing session ID.' });

    const ret = await players.endSession(req.body.session);
    return res.sendAndLog({ success: !!ret?.id });
}


// Fetch player data by session cookie
async function fetch(req, res, next) {
    if (!req.body.session) return next({ status: 400, message: 'Missing session ID.' });

    const player = await players.fetchSession(req.body.session);
    return player ? res.sendAndLog(player) : next({ status: 204 });
}


module.exports = { login, logout, fetch };