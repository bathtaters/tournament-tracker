const ops = require('./basicAccess');
const player = require('../controllers/player');
const settings = require('../controllers/settings');
const team = require('../controllers/team');
const draft = require('../db/controllers/draft');
const match = require('../db/controllers/match');
const clock = require('../controllers/clock');

const initTestFile = require('path').join(__dirname,'dbtest.sql');

const hold = (ms) => new Promise(r => setTimeout(r, ms));

async function dbCheck() {
    let temp;
    
    // CLEAR DB
    // console.log('Resetting database...'); await require('../db/admin/connect').resetDb();
    console.log('Initializing test data...'); await ops.file(initTestFile);

    // Data for testing
    const playIds = await player.list().then(a => console.log('getPlayIds:',a.map(p=>p.name))||a.map(p => p.id));
    const useDraft = await draft.list().then(r => r.find(d => d.title == 'KLD'));
    const altDraft = await draft.list().then(r => r.find(d => d.title == 'CPY'));
    
    /* TEST SETTINGS
    await settings.getAll().then(console.log);
    await settings.batchSet({ test1: 'A', test2: 2, test3: {a:1,b:2,c:3} }).then(console.log);
    await settings.getAll().then(console.log);
    await settings.rmv('test1').then(console.log);
    await settings.rmv('test2').then(console.log);
    await settings.rmv('test3').then(console.log);
    await settings.getAll().then(console.log);
    //*/

    /* VIEW ALL
    console.log('MATCHES')
    await ops.query("SELECT * FROM match;").then(console.log);
    console.log('DRAFTS')
    await ops.query("SELECT * FROM draft;").then(console.log);
    console.log('PLAYERS')
    await ops.query("SELECT * FROM player;").then(console.log);
    //*/
    
    /* TEST VIEWS
    console.log('Getting player/teamView...');
    const t = await ops.query("SELECT * FROM player WHERE isTeam IS TRUE LIMIT 1;")
    .then(r => console.log(r) || r);
    const p = await ops.query("SELECT * FROM player WHERE id = $1;",[t.members[0]])
    .then(r => console.log(r) || r);
    await ops.query("SELECT * FROM team WHERE id = $1;",[t.id])
    .then(console.log);
    
    console.log('Getting draft...');
    await ops.query("SELECT * FROM draft WHERE title = $1;",['KLD'])
        .then(r => console.log(r) || r);
    await ops.query("SELECT * FROM draftReport WHERE id = $1;",[useDraft.id]).then(console.log);
    await ops.query("SELECT * FROM draftByes;").then(console.log);

    console.log('Getting match...');
    const m = await ops.query(
        "SELECT * FROM match WHERE draftId = $1 AND round = 1 AND players ? $2::STRING;",
        [useDraft.id, p.id]
        ).then(r => console.log(r) || r);
        
        console.log('Getting matchViews...');
        await ops.query("SELECT players FROM allPlayers WHERE id = $1;",[m.draftid])
        .then(console.log);
        const w = await ops.query("SELECT * FROM matchDetail WHERE id = $1;",[m.id])
        .then(r => console.log(r) || r);
        
        console.log('Getting draftPlayerView...');
        const res = await ops.query(
            "SELECT * FROM draftPlayer WHERE draftId = $1 AND playerId = $2;",
            [useDraft.id, p.id]
    ).then(r => console.log(r) || r);

    console.log('Getting matchPlayerView...');
    for (const mId of res.matches) {
        await ops.query(
            "SELECT * FROM matchPlayer JOIN match ON matchId = match.id WHERE matchId = $1 AND playerId = $2;",
            [mId, p.id]
        ).then(console.log);
    }
    
    console.log('Getting breakersView...');
    await ops.query(
            "SELECT * FROM breakers WHERE draftId = $1 AND playerId = $2;",
            [useDraft.id, p.id]
    ).then(r => console.log(r) || r);
    await ops.query(
            "SELECT * FROM breakers WHERE draftId = $1;",
            [useDraft.id]
    ).then(r => console.log(r) || r);
    //*/

    /* PLAYERS: TEST SUCCESS!
    console.log('\nPlayers... *******************************');
    await player.list().then(console.log);
    temp = await player.add('NewPlayer');
    console.log('NewPlayerID:',temp);
    await player.list().then(r=>console.log(r.map(p=>`${p.name}<${p.id}>`).join(', ')));
    await player.rename(temp,'EditPlayer');
    await player.list().then(r=>console.log(r.map(p=>`${p.name}<${p.id}>`).join(', ')));
    await player.get(temp).then(console.log);
    await player.rmv(temp);
    await player.list().then(r=>console.log(r.map(p=>`${p.name}<${p.id}>`).join(', ')));
    //*/

    /* TEAMS: TEST SUCCESS!
    console.log('\nTeams... *******************************');
    await team.list().then(console.log);
    temp = await team.add(playIds.slice(0,2));
    console.log('NewTeamID:',temp);
    await team.list().then(r=>console.log(r.map(p=>`${p.name || '['+Object.keys(p.members).length+']'}<${p.id}>`).join(', ')));
    await player.get(temp).then(console.log);
    await team.get(temp).then(console.log);
    await player.rename(temp,'NewTeam').then(console.log);
    await team.list().then(r=>console.log(r.map(p=>`${p.name || '['+Object.keys(p.members).length+']'}<${p.id}>`).join(', ')));
    await player.get(playIds[2]).then(console.log);
    await team.addMember(temp,playIds[2]);
    await team.get(temp).then(console.log);
    await player.get(playIds[3]).then(console.log);
    await team.replaceMember(temp,playIds[2],playIds[3]);
    await team.get(temp).then(console.log);
    await team.rmvMember(temp,playIds[3]);
    await team.get(temp).then(console.log);
    await team.list().then(r=>console.log(r.map(p=>`${p.name || '['+Object.keys(p.members).length+']'}<${p.id}>`).join(', ')));
    await team.rmv(temp);
    await team.list().then(r=>console.log(r.map(p=>`${p.name || '['+Object.keys(p.members).length+']'}<${p.id}>`).join(', ')));
    //*/

    /* DRAFTS: TEST SUCCESS!
    console.log('\nDrafts... *******************************');
    await draft.dayList().then(console.log);
    await draft.list().then(console.log);
    temp = await draft.add({title: 'TestDraft', day: new Date()});
    console.log('NewDraft.id:',temp);
    await draft.list().then(console.log);
    await draft.dayList().then(console.log);
    await draft.set(temp,{title:'EditDraft', clockLimit: '0:0:1800', playerspermatch: 4});
    await draft.list().then(console.log);
    await draft.get(temp).then(console.log);
    await draft.rmv(temp);
    await draft.list().then(console.log);
    console.log(' --- Add/Remove Players --- ');
    temp = await draft.list().then(r=>r[0].id);
    await draft.get(temp).then(console.log);
    await draft.addPlayer(temp,playIds);
    console.log('added',playIds.length,'players');
    await draft.get(temp).then(console.log);
    await draft.dropPlayer(temp,playIds[1]);
    console.log('Dropped',playIds[1]);
    await draft.get(temp).then(console.log);
    await draft.addPlayer(temp,playIds[1]);
    console.log('Added',playIds[1]);
    await draft.get(temp).then(console.log);
    await draft.dropPlayer(temp,playIds);
    console.log('dropped',playIds.length,'players');
    await draft.get(temp).then(console.log);
    //*/
    
    /* CLOCKS: TEST SUCCESS!
    console.log('\nClocks... *******************************');
    temp = await draft.add({title: 'ClockTest', day: new Date(), clockLimit: 10});
    await draft.get(temp).then(console.log);
    await clock.getClock(temp).then(console.log);
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
    
    /* MATCHES: TEST SUCCESS!
    console.log('\nMatches... *******************************');
    console.log('Using Draft:',useDraft.title);
    await match.list(useDraft.id).then(console.log);
    // await match.listDetail(useDraft.id).then(console.log);
    console.log('\nROUND',2);
    await match.listDetail(useDraft.id,2).then(console.log);
    temp = await match.list(useDraft.id,2).then(r=>console.log(r)||Object.keys(r));
    console.log('DemoMatchID',temp);
    // ADD ROUND
    await draft.get(useDraft.id).then(console.log);
    await match.list(useDraft.id).then(console.log);
    console.log(' --- ADD ROUND --- ');
    await match.pushRound(useDraft.id)
        .then(r=>{if (r.error) console.error(r.error); else if(!r.round) console.log('DRAFT HAS ENDED.'); return r.round;});
    await match.popRound(useDraft.id);
    await match.list(useDraft.id).then(console.log);
    await draft.dropPlayer(useDraft.id,playIds[1]);
    await draft.get(useDraft.id).then(console.log);
    const round = await match.pushRound(useDraft.id)
        .then(r=>{if(r.error) console.error(r.error); else if(!r.round) console.log('DRAFT HAS ENDED.'); return r.round;});
    await draft.get(useDraft.id).then(console.log);
    await match.list(useDraft.id).then(console.log);
    console.log('Added round',round);
    temp = await match.listDetail(useDraft.id,round)
        .then(r=>console.log(r)||r);
    console.log(' --- SWAP --- '); 
    console.log('SWAP(',Object.keys(temp[0].players)[0], temp[0].id, Object.keys(temp[2].players)[1], temp[2].id,')');
    await player.swap(Object.keys(temp[0].players)[0], temp[0].id, Object.keys(temp[2].players)[1], temp[2].id);
    console.log('SWAPPED',0,Object.keys(temp[0].players)[0],2,Object.keys(temp[2].players)[1]);
    await match.listDetail(useDraft.id,round).then(console.log);
    console.log(' --- GET --- ');
    await match.get(temp[0].id, false).then(console.log);
    await match.get(temp[0].id, true).then(console.log);
    console.log('Using Draft:',altDraft.title,1);
    await match.list(altDraft.id,1).then(r=>console.log(r)||match.get(Object.keys(r)[0], false)).then(console.log);
    console.log(' --- REPORT --- ');
    console.log('DRAFT',useDraft.title,'ROUND',round);
    let fakeResults = temp[0].players;
    fakeResults.draws = Math.floor(Math.random() * 3);
    Object.keys(fakeResults).forEach(k => fakeResults[k] = Math.floor(Math.random() * 3))
    await match.report(temp[0].id, fakeResults);
    await match.get(temp[0].id, true).then(console.log);
    fakeResults = temp[1].players;
    Object.keys(fakeResults).forEach(k => fakeResults[k] = Math.floor(Math.random() * 3))
    fakeResults.draws = Math.floor(Math.random() * 3);
    await match.get(temp[1].id, true).then(console.log);
    await match.report(temp[1].id, fakeResults);
    await match.get(temp[1].id, true).then(console.log);
    await match.unreport(temp[1].id);
    await match.get(temp[1].id, true).then(console.log);
    console.log(' --- DELETE ROUND --- ');
    await match.list(useDraft.id).then(console.log);
    await match.popRound(useDraft.id);
    await match.list(useDraft.id).then(console.log);
    //*/
    
    /*console.log('\nRecords... *******************************');
    try {
        await draft.getRecord().then(console.log);
    } catch (e) { console.error('ERROR getRecord():',e); }
    console.log('PLAYER',playIds[0],'DRAFT',useDraft.title);
    await draft.getRecord({draftId: useDraft.id, playerId: playIds[0]},{asScore:1,ofGames:0}).then(console.log);
    await draft.getRecord({draftId: useDraft.id, playerId: playIds[0]},{asScore:0,ofGames:0}).then(console.log);
    await draft.getRecord({draftId: useDraft.id, playerId: playIds[0]},{asScore:1,ofGames:1}).then(console.log);
    await draft.getRecord({draftId: useDraft.id, playerId: playIds[0]},{asScore:0,ofGames:1}).then(console.log);
    await draft.getRecord({playerId: playIds[0]}).then(console.log);
    await draft.getRecord({playerId: playIds[0]},{sortByDraft:1}).then(console.log);
    await draft.getRecord({draftId: useDraft.id}).then(console.log);
    await draft.getBreakers(useDraft.id, playIds.slice(1,4)).then(console.log);
    await draft.getBreakers(useDraft.id).then(console.log);
    //*/
    
    // Close connection
    console.log('Finished');
}

dbCheck();