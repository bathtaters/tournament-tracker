const generateMatchups = require('./swissMonrad')

// NOTE: Uses un-mocked matchGen.utils, ensure that passes test first //

describe('generateMatchups', () => {
  const stats = {
    a: { matchRate: 0.7, oppMatch: 0.2, gameRate: 0.9, oppGame: 0.3 },
    b: { matchRate: 0.5, oppMatch: 0.5, gameRate: 0.7, oppGame: 0.4 },
    c: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.7, oppGame: 0.3 },
    d: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.3 },
    e: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.2 },
    f: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.2 },
    ranking: ['a','b','c','d'],
  }
  const fullStats = { ...stats, ranking: stats.ranking.concat('e','f') }
  const blankStats = { ranking: stats.ranking, noStats: true }

  it('pairs using stats to rank', () => {
    expect(generateMatchups(stats, { playerspermatch: 2 }))
      .toEqual([['a','b'],['c','d']])
  })

  it('randomly pairs w/o data', () => {
    const anyone = expect.stringMatching(/^[abcd]$/)
    expect(generateMatchups(blankStats, { playerspermatch: 2 }))
      .toEqual([[anyone,anyone],[anyone,anyone]])
  })

  it('pairs with uneven playerCount', () => {
    expect(generateMatchups(stats, { playerspermatch: 3 }))
      .toEqual([['a','b','c'],['d']])
  })

  it('no repeat byes', () => {
    expect(generateMatchups(stats, {
      playerspermatch: 3,
      byes: ['d','c']
    })).toEqual([['a','c','d'],['b']])
  })

  it('no repeat matchups', () => {
    expect(
      generateMatchups(fullStats, {
        playerspermatch: 2,
        oppData: { a: ['f','e','d','b'], b: ['a','d'], c: ['f'], d: ['f','b','a'], e: ['f','a'], f: ['a','e','d','c'] }
      })
    ).toEqual([['a','c'], ['b','f'], ['d','e']])
  })

  it('least amount of repeat byes', () => {
    expect(generateMatchups(stats, {
      playerspermatch: 3,
      byes: ['a','b','c','d','d','d','c','c','b','a']
    })).toEqual([['a','c','d'],['b']])
  })

  it('least amount of repeat matchups', () => {
    
    expect(
      generateMatchups(fullStats, {
        playerspermatch: 2,
        oppData: {
          a: ['f','f','f','e','e','d','d','d','b','c'],
          b: ['a','d','d','d','c','e','f'],
          c: ['f','f','b','a','d'],
          d: ['f','f','b','b','b','a','a','a','c'],
          e: ['f','f','f','a','a','b'],
          f: ['a','a','a','e','e','e','d','d','c','c','b']
        }
      })
    ).toEqual([['a','c'], ['b','f'], ['d','e']])
  })
})
