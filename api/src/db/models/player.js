/* *** PLAYER Object *** */
const db = require('../admin/interface');
const strings = require('../sql/strings').player;
const defs = require('../../config/validation').defaults.player;
const util = require('../../utils/session.utils');

// Player Table Operations //

// Get single or all (ids only) players
const get = id => db.getRow('player', id).then(r => Array.isArray(r) ? r.map(util.stripPassword) : r && util.stripPassword(r));
const hasPass = id => db.getRow('player', id).then(r => Array.isArray(r) ? r.map(util.checkPassword) : r && util.checkPassword(r));
const list = () => db.getRow('player',null,'id').then(r => r && r.map(p => p.id));

// Start/End/Fetch User Sessions
const resetLogin = id => db.updateRow(
    'player',
    id,
    { session: util.newSessionID(), password: null },
    { returning: 'session' }
).then(r => r.session);

const startSession = name => db.updateRow(
    'player',
    name.toLowerCase(),
    { session: util.newSessionID() },
    { idCol: 'lower_name', returning: 'session' }
).then(r => r.session);

const fetchSession = session => db.getRow(
    'player',
    session,
    null,
    { idCol: 'session', getOne: true }
).then(r => r && util.stripPassword(r));

const endSession = session => db.updateRow(
    'player',
    session,
    { session: null },
    { idCol: 'session' }
);

// Get Event detail for player
const getPlayerEvents = playerids => db.query(playerids.map(() => strings.eventFilter), playerids.map(id => [id]), true)

// Get Match detail for player
const getPlayerMatches = playerid => db.getRow('matchDetail', playerid, null, { idCol: 'ANY(players)', getOne: false });

// Add new player
const add = playerData => db.addRow('player', { ...defs, ...playerData });

// Check password (Or set if no password) -- Return 0 on success, reason string on failure
async function checkPassword(name, password) {
    const stored = await db.getRow('player', name, ['id','password'], { idCol: 'name', getOne: true, looseMatch: true });
    if (!stored || !stored.id) return 'Player not found.';

    let guess;
    try { guess = await util.encryptPassword(password); }
    catch (err) { return err.message || err || 'Error encrypting password.'; }

    if (!stored.password) return 'Password not set, contact administrator if you don\'t have a password link.';
    
    return util.passwordsMatch(guess, stored.password) ? 0 : 'Incorrect password.';
}


module.exports = {
    get, hasPass, list, add,

    startSession, 
    resetLogin, 
    fetchSession,
    endSession,
    
    getPlayerEvents,
    getPlayerMatches,
    checkPassword,
    
    rmv: id => db.rmvRow('player', id),
    set: (id, newParams) => db.updateRow('player', id, newParams),
}