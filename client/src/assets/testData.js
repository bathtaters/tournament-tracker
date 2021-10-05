const testData = {
  schedule: [
    { day: new Date('10/5/21'), drafts: ['d1','d2'] },
    { day: new Date('10/6/21'), drafts: ['d3','d4','d6'] },
    { day: new Date('10/7/21'), drafts: ['d5'] },
    { day: null, drafts: [ 'd8','d9' ] }
  ],
  drafts: {
    d1: {
      title: 'KLD Draft', isDone: false,
      matches: [
        [
          {
            id:'d1m5', draws: 0, reported: true,
            players: {nc1: 1, ad1: 2}
          },{
            id:'d1m6', draws: 0, reported: true,
            players: {mr1: 2, iq1: 1}
          },{
            id:'d1m7', draws: 0, reported: true,
            players: {af1: 2, js1: 0}
          },{
            id:'d1m8', draws: 1, reported: true,
            players: {td1: 1, cd1: 0}
          }
        ],[
          {
            id:'d1m5', draws: 0, reported: false,
            players: {nc1: 0, cd1: 0}
          },{
            id:'d1m6', draws: 0, reported: false,
            players: {js1: 0, iq1: 0}
          },{
            id:'d1m7', draws: 0, reported: false,
            players: {af1: 0, mr1: 0}
          },{
            id:'d1m8', draws: 0, reported: false,
            players: {td1: 0, ad1: 0}
          }
        ]
      ],
      ranking: ['mr1','af1','ad1','td1','iq1','cd1','nc1','js1'],
    },
    d2: {title: 'CPY Draft', isDone: true}, d5: {title: 'CKY Draft', isDone: false},
    d3: {title: 'MM2 Draft', isDone: true}, d4: {title: 'AKH Draft', isDone: false}, d6: {title: 'GRN Draft', isDone: false},
    d8: {title: 'Party Draft', isDone: false}, d9: {title: 'Cube Draft', isDone: false}
  },
  players: {
    nc1: { name: 'Nick', record: [0,1,0], username: 'bathtaters'},
    mr1: { name: 'Matt', record: [1,0,0], username: 'mjr2020'},
    af1: { name: 'Foff', record: [1,0,0], username: 'lafoaf'},
    td1: { name: 'Taylor', record: [1,0,0], username: 'izzetnow'},
    cd1: { name: 'Cosme', record: [0,1,0], username: 'quaker2000'},
    iq1: { name: 'Ian', record: [0,1,0], username: 'seattleboy69'},
    js1: { name: 'Joe', record: [0,1,0], username: 'monoredjoe'},
    ad1: { name: 'Al', record: [1,0,0], username: 'mtgdeals'},
  },
  activeUser: 'nc1'
};

export default testData;