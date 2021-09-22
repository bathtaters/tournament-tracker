const db = require('../db/admin/connect');
const dbOp = require('../db/admin/base');
const player = require('../db/player');
const draft = require('../db/draft');
const match = require('../db/match');
const clock = require('../db/clock');

const hold = (ms) => new Promise(r => setTimeout(r, ms));

async function dbCheck() {
    let temp;
    
    // SETUP
    console.log('Resetting database...');
    await db.resetDb();
    console.log('Initializing test data...');
    await db.runSqlFile(require('path').join(__dirname,'dbtest.sql'));

    const playIds = await player.list().then(a => a.map(p => p.id));
    
    //* PLAYERS: TEST SUCCESS!
    console.log('\nPlayers...');
    await player.list().then(console.log);
    temp = await player.add('NewPlayer');
    console.log('NewPlayer',temp);
    await player.list().then(console.log);
    await player.rename(temp,'EditPlayer');
    await player.list().then(console.log);
    await player.get(temp).then(console.log);
    await player.rmv(temp);
    await player.list().then(console.log);
    //*/

    //* DRAFTS: TEST SUCCESS!
    console.log('\nDrafts...');
    await draft.dayList().then(console.log);
    await draft.list().then(console.log);
    temp = await draft.add({title: 'TestDraft', day: new Date()});
    console.log('NewDraft.id:',temp);
    await draft.list().then(console.log);
    await draft.set(temp,{title:'EditDraft', clockLimit: 1800, teamSize: 2});
    await draft.dayList().then(console.log);
    await draft.list().then(console.log);
    await draft.get(temp).then(console.log);
    await draft.rmv(temp);
    await draft.list().then(console.log);
    console.log(' --- Add/Remove Players --- ');
    temp = await draft.list().then(r=>r[0].id);
    await draft.get(temp).then(console.log);
    await draft.addPlayer(temp,playIds);
    await draft.get(temp).then(console.log);
    await draft.dropPlayer(temp,playIds[1]);
    console.log('Dropped',playIds[1]);
    await draft.getPlayers(temp).then(console.log);
    await draft.get(temp).then(console.log);
    await draft.addPlayer(temp,playIds[1]);
    console.log('Added',playIds[1]);
    await draft.getPlayers(temp).then(console.log);
    await draft.dropPlayer(temp,playIds);
    await draft.getPlayers(temp).then(console.log);
    await draft.get(temp).then(console.log);
    //*/
    
    //* CLOCKS: TEST SUCCESS!
    console.log('\nClocks...');
    temp = await draft.add({title: 'ClockTest', day: new Date(), clockLimit: 10});
    await clock.getAll(temp).then(console.log);
    await clock.start(temp).then(() => console.log(' >> START CLOCK >> '));
    await clock.getAll(temp).then(console.log);
    await hold(5000).then(() => console.log(' ~~ 5 seconds ~~ '));
    await clock.getAll(temp).then(console.log);
    await clock.pause(temp).then(() => console.log(' || PAUSE CLOCK || '));
    await clock.getAll(temp).then(console.log);
    await hold(5000).then(() => console.log(' ~~ 5 seconds ~~ '));
    await clock.getAll(temp).then(console.log);
    await clock.start(temp).then(() => console.log(' >> RESUME CLOCK >> '));
    await clock.getAll(temp).then(console.log);
    await hold(4000).then(() => console.log(' ~~ 3 seconds ~~ '));
    await clock.getAll(temp).then(console.log);
    await hold(1000).then(() => console.log(' ~~ 1 second  ~~ '));
    await clock.getAll(temp).then(console.log);
    await hold(1000).then(() => console.log(' ~~ 1 second  ~~ '));
    await clock.getAll(temp).then(console.log);
    await hold(1000).then(() => console.log(' ~~ 1 second  ~~ '));
    await clock.getAll(temp).then(console.log);
    await clock.reset(temp).then(() => console.log(' 00 RESET CLOCK 00'));
    await clock.getAll(temp).then(console.log);
    //*/
    
    //* MATCHES: TEST SUCCESS!
    console.log('\nmatches...');
    const useDraft = await draft.list().then(d => d[0]);
    const altDraft = await draft.list().then(d => d[1]);
    console.log('Using Draft:',useDraft.title,2);
    await match.list(useDraft.id,2).then(console.log);
    console.log(' --- ADD ROUND --- ');
    const round = await match.addRound(useDraft.id,[[playIds[0],playIds[1]],[playIds[2],playIds[3]],[playIds[4],playIds[5]],[playIds[6],playIds[7]]]);
    await match.list(useDraft.id,round).then(console.log);
    console.log(' --- SWAP --- ');
    temp = await match.list(useDraft.id, round);
    await match.swapPlayers(temp[0].players[0], temp[0].id, temp[2].players[0], temp[2].id);
    await match.list(useDraft.id,round).then(console.log);
    temp = await match.list(useDraft.id, round);
    await match.swapPlayers(temp[1].players, temp[1].id, temp[3].players, temp[3].id);
    await match.list(useDraft.id,round).then(console.log);
    console.log(' --- GET --- ');
    await match.get(temp[0].id, false).then(console.log);
    await match.get(temp[0].id, true).then(console.log);
    console.log('Using Draft:',altDraft.title,2);
    await match.list(altDraft.id,1).then(r => match.get(r[0].id, false)).then(console.log);
    console.log(' --- REPORT --- ');
    console.log('DRAFT',useDraft.title,'ROUND',round);
    await match.report(temp[0].id, 1);
    await match.get(temp[0].id, true).then(console.log);
    await match.report(temp[1].id, 0);
    await match.get(temp[1].id, true).then(console.log);
    await match.report(temp[2].id, 2);
    await match.get(temp[2].id, true).then(console.log);
    await match.report(temp[3].id, 1);
    await match.get(temp[3].id, true).then(console.log);
    console.log('DRAFT',altDraft.title,'ROUND',1);
    await match.list(altDraft.id).then(r => r.map(g => `${g.round}) ${g.players[0]} vs. ${g.players[1]}`)).then(console.log);
    temp = await match.list(altDraft.id,1);
    await match.report(temp[0].id, 1);
    await match.get(temp[0].id, false).then(console.log);
    await match.report(temp[1].id, 2);
    await match.get(temp[1].id, false).then(console.log);
    console.log(' --- GET RECORD --- ');
    await match.getRecord(true).then(console.log);
    await match.getRecord(false).then(console.log);
    console.log('PLAYER',playIds[0]);
    await match.getRecord(false, { draftId: useDraft.id, playerId: playIds[0] }).then(console.log);
    await match.getRecord(true, { playerId: playIds[0] }).then(console.log);
    await match.getRecord(false, { draftId: useDraft.id }).then(console.log);
    await match.getRecord(false, { draftId: altDraft.id }).then(console.log);
    console.log(' --- DELETE ROUND --- ');
    await match.list(useDraft.id).then(r => r.map(g => `${g.round}) ${g.players[0]} vs. ${g.players[1]}`)).then(console.log);
    await match.deleteRound(useDraft.id, round);
    await match.list(useDraft.id).then(r => r.map(g => `${g.round}) ${g.players[0]} vs. ${g.players[1]}`)).then(console.log);
    //*/
    
    
    // Close connection
    await dbOp.deinit(); console.log('Finished');
}

dbCheck();