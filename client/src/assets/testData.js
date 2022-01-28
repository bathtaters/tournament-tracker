const playerList = ['mr1','af1','ad1','td1','iq1','cd1','nc1','js1'];
const testData = {
  settings: {
    title: "Tournament Tracker Demo",
    dateRange: [ (new Date(Date.now() - 1000*60*60*24*2)).getTime(), (new Date(Date.now() + 1000*60*60*24*4)).getTime() ],
  },
  schedule: [
    { day: null, events: [ 'd8','d9' ] },
    { day: (new Date(Date.now() - 1000*60*60*24)).getTime(), events: ['d1','d2'] },
    { day: (new Date()).getTime(), events: ['d3','d4','d6'] },
    { day: (new Date(Date.now() + 1000*60*60*24)).getTime(), events: ['d5'] },
  ],
  events: {
    d1: {
      title: 'KLD Event', isDone: false,
      matches: [
        [
          {
            id:'d1m11', draws: 0, reported: true,
            players: {nc1: 1, ad1: 2}
          },{
            id:'d1m12', draws: 0, reported: true,
            players: {mr1: 2, iq1: 1}
          },{
            id:'d1m13', draws: 0, reported: true,
            players: {af1: 2, js1: 0}
          },{
            id:'d1m14', draws: 1, reported: true,
            players: {td1: 1, cd1: 0}
          }
        ],[
          {
            id:'d1m21', draws: 0, reported: false,
            players: {nc1: 0, cd1: 0}
          },{
            id:'d1m22', draws: 0, reported: false,
            players: {js1: 0, iq1: 0}
          },{
            id:'d1m23', draws: 0, reported: false,
            players: {af1: 0, mr1: 0}
          },{
            id:'d1m24', draws: 0, reported: false,
            players: {td1: 0, ad1: 0}
          }
        ]
      ],
      ranking: playerList,
    },
    d2: {title: 'CPY Event',   ranking: playerList, isDone: true }, d5: {title: 'CKY Event',  ranking: playerList, isDone: false},
    d3: {title: 'MM2 Event',   ranking: playerList, isDone: true }, d4: {title: 'AKH Event',  ranking: playerList, isDone: false},
    d6: {title: 'GRN Event',   ranking: playerList, isDone: false},
    d8: {title: 'Party Event', ranking: playerList, isDone: false}, d9: {title: 'Cube Event', ranking: playerList, isDone: false},
  },
  players: {
    mr1: { name: 'Matt', record: [1,0,0] },
    af1: { name: 'Foff', record: [1,0,0] },
    td1: { name: 'Taylor', record: [1,0,0] },
    ad1: { name: 'Al', record: [1,0,0] },
    nc1: { name: 'Nick', record: [0,1,0] },
    cd1: { name: 'Cosme', record: [0,1,0] },
    iq1: { name: 'Ian', record: [0,1,0] },
    js1: { name: 'Joe', record: [0,1,0] },
  },
  ranking: ['mr1','af1','ad1','td1','nc1','iq1','cd1','js1'],
};

export default testData;