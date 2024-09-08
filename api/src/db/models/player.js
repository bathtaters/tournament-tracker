/* *** PLAYER Object *** */
const db = require('../admin/interface');
const log = require('./log');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').defaults.player;
const util = require('../../utils/session.utils');

// Player Table Operations //

// Get single or all (ids only) players
const get = id => db.getRow('player', id).then(r => Array.isArray(r) ? r.map(util.stripPassword) : r && util.stripPassword(r));
const getUser = name => db.getRow('player', name, ['id','password'], { idCol: 'name', getOne: true, looseMatch: true });
const hasPass = id => db.getRow('player', id).then(r => Array.isArray(r) ? r.map(util.checkPassword) : r && util.checkPassword(r));
const list = () => db.getRow('player',null,'id').then(r => r && r.map(p => p.id));

// Start/End/Fetch User Sessions
const resetLogin = (id, userid) => log.updateRows(
    'player',
    id,
    { session: util.newSessionID(), password: null },
    userid,
).then((r) => r.session);

const startSession = (name, userid, session) => log.updateRows(
    'player',
    name.toLowerCase(),
    { session },
    userid,
    { idCol: 'lower_name' }
).then(r => r.session);

const sessionPlayer = (session) => db.getRow(
    'player',
    session,
    null,
    { idCol: 'session', getOne: true }
).then(r => r && util.stripPassword(r));

const endSession = (userid, session) => log.updateRows(
    'player',
    session,
    { session: null },
    userid,
    { idCol: 'session' }
);

// Get Event detail for player
const getPlayerEvents = (playerids) => db.query(playerids.map(() => strings.eventFilter), playerids.map(id => [id]), true)

// Get Match detail for player
const getPlayerMatches = (playerid) => db.getRow('matchDetail', playerid, null, { idCol: 'ANY(players)', getOne: false });

// Add new player
const add = (playerData, userid) => log.addRows('player', { ...defs, ...playerData }, userid);

// Check password (Or set if no password) -- Return [user, null] on success, [null, reason string] on failure
async function checkPassword(name, password, user) {
    if (!user?.id) return log.login(null, 'Player not found.', name);

    let guess;
    try { guess = await util.encryptPassword(password); }
    catch (err) { return log.login(user.id, err.message || err || 'Error encrypting password.'); }

    if (!user.password) return log.login(user.id, 'Password not set, contact administrator if you don\'t have a password link.');
    
    return log.login(user.id, util.passwordsMatch(guess, user.password) ? null : 'Incorrect password.');
}


module.exports = {
    get, getUser, hasPass, list, add,

    startSession, 
    resetLogin, 
    sessionPlayer,
    endSession,
    
    getPlayerEvents,
    getPlayerMatches,
    checkPassword,
    
    rmv: (id, userid) => log.rmvRows('player', id, null, userid),
    set: (id, newParams, userid) => log.updateRows('player', id, newParams, userid),
}