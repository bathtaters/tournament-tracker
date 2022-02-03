// Import test functions
const statUtil = require('./stats.utils');
const {
  rate, getWLD,
  calcBase, calcRates, calcOpps,
  combineStats, combineFinal,
  finalize, rankSort
} = statUtil;

// Force to use these constants
jest.mock('../config/constants', () => ({
  points: { win: 3, draw: 1, floor: 0.33 }
}));


// ---- GET WIN % ---- // 

describe('rate', () => {
  it('works', () => {
    expect(rate(0, [1]    )).toBeCloseTo(0.33)
    expect(rate(0, [0]    )).toBe(NaN)
    expect(rate(3, [1,0]  )).toBeCloseTo(1)
    expect(rate(3, [1,2]  )).toBeCloseTo(1 / 3)
    expect(rate(1, [1,1,1])).toBeCloseTo(0.33)
    expect(rate(8, [2,1,0])).toBeCloseTo(8 / (3 * 3))
  })
  it('allows missing params', () => {
    expect(rate()).toBe(NaN)
  })
})


// ---- GET W/L/D RECORD ---- // 

describe('getWLD', () => {
  it('win', () => {
    expect(getWLD({ wins: [0], maxwins: 0 })).toEqual([0])
    expect(getWLD({ wins: [5], maxwins: 5 })).toEqual([0])
  })
  it('lose', () => {
    expect(getWLD({ wins: [0], maxwins: 5 })).toEqual([1])
    expect(getWLD({ wins: [3], maxwins: 5 })).toEqual([1])
  })
  it('draw', () => {
    expect(getWLD({ wins: [0,0], maxwins: 0 })).toEqual([2,2])
    expect(getWLD({ wins: [5,5], maxwins: 5 })).toEqual([2,2])
  })
  it('2p basic', () => {
    expect(getWLD({ wins: [5,0], maxwins: 5 })).toEqual([0,1])
    expect(getWLD({ wins: [0,5], maxwins: 5 })).toEqual([1,0])
    expect(getWLD({ wins: [0,0], maxwins: 0 })).toEqual([2,2])
    expect(getWLD({ wins: [5,5], maxwins: 5 })).toEqual([2,2])
  })
  it('2p advanced', () => {
    expect(getWLD({ wins: [0,0], maxwins: 5 })).toEqual([1,1])
    expect(getWLD({ wins: [3,3], maxwins: 5 })).toEqual([1,1])
  })
  it('3p basic', () => {
    expect(getWLD({ wins: [5,3,0], maxwins: 5 })).toEqual([0,1,1])
    expect(getWLD({ wins: [3,5,0], maxwins: 5 })).toEqual([1,0,1])
    expect(getWLD({ wins: [3,0,5], maxwins: 5 })).toEqual([1,1,0])
    expect(getWLD({ wins: [0,0,0], maxwins: 0 })).toEqual([2,2,2])
    expect(getWLD({ wins: [5,5,5], maxwins: 5 })).toEqual([2,2,2])
  })
  it('3p advanced', () => {
    expect(getWLD({ wins: [0,5,5], maxwins: 5 })).toEqual([1,2,2])
    expect(getWLD({ wins: [5,3,5], maxwins: 5 })).toEqual([2,1,2])
    expect(getWLD({ wins: [5,5,0], maxwins: 5 })).toEqual([2,2,1])
    expect(getWLD({ wins: [0,0,0], maxwins: 5 })).toEqual([1,1,1])
    expect(getWLD({ wins: [3,3,3], maxwins: 5 })).toEqual([1,1,1])
  })
  it('throws on win > maxwins', () => {
    expect.assertions(5)
    expect(() => getWLD({ wins: [5], maxwins: 0 })).toThrowError("Invalid maxwins: 0 => [5]")
    expect(() => getWLD({ wins: [5], maxwins: 3 })).toThrowError("Invalid maxwins: 3 => [5]")
    expect(() => getWLD({ wins: [0,5], maxwins: 0 })).toThrowError("Invalid maxwins: 0 => [0,5]")
    expect(() => getWLD({ wins: [0,5], maxwins: 3 })).toThrowError("Invalid maxwins: 3 => [0,5]")
    expect(() => getWLD({ wins: [3,5], maxwins: 3 })).toThrowError("Invalid maxwins: 3 => [3,5]")
  })
})


// ---- STATS CALC ---- // 

describe('calcBase', () => {
  const calcData = [
    // WLD array
    [1,0,2], {
      //  wins, draws, totalwins
      wins: [0,3,1],
      draws: 2,
      totalwins: 4,
    // eventid
    }, 'd1',
  ];
  const playerA = calcBase(0, ...calcData)
  const playerB = calcBase(1, ...calcData)
  const playerC = calcBase(2, ...calcData)

  it('eventids', () => {
    expect(playerA).toHaveProperty('eventids',['d1'])
    expect(playerB).toHaveProperty('eventids',['d1'])
    expect(playerC).toHaveProperty('eventids',['d1'])
  })
  it('matchRecord', () => {
    expect(playerA).toHaveProperty('matchRecord',[0,1,0])
    expect(playerB).toHaveProperty('matchRecord',[1,0,0])
    expect(playerC).toHaveProperty('matchRecord',[0,0,1])
  })
  it('gameRecord', () => {
    expect(playerA).toHaveProperty('gameRecord',[0,4,2])
    expect(playerB).toHaveProperty('gameRecord',[3,1,2])
    expect(playerC).toHaveProperty('gameRecord',[1,3,2])
  })
  it('matchScore', () => {
    expect(playerA).toHaveProperty('matchScore', 0)
    expect(playerB).toHaveProperty('matchScore', 3)
    expect(playerC).toHaveProperty('matchScore', 1)
  })
  it('gameScore', () => {
    expect(playerA).toHaveProperty('gameScore', 2)
    expect(playerB).toHaveProperty('gameScore', 11)
    expect(playerC).toHaveProperty('gameScore', 5)
  })
})

describe('calcRates', () => {
  // Setup spy
  const rateSpy = jest.spyOn(statUtil,'rate');

  beforeEach(() => rateSpy
    .mockImplementationOnce(() => 'MRate')
    .mockImplementationOnce(() => 'GRate')
  )
  afterAll(() => rateSpy.mockRestore())

  it('calls rate', () => {
    calcRates({matchScore: 'MS', gameScore: 'GS', matchRecord: 'MR', gameRecord: 'GR'})
    expect(rateSpy).toBeCalledTimes(2)
    expect(rateSpy).toHaveBeenNthCalledWith(1, 'MS', 'MR')
    expect(rateSpy).toHaveBeenNthCalledWith(2, 'GS', 'GR')
  })
  it('passes rate results', () => {
    expect(calcRates({})).toEqual({ matchRate: 'MRate', gameRate: 'GRate' })
  })
})

describe('calcOpps', () => {
  const sampleData = {
    'a': { matchRate: 1.0, gameRate: 0.75 },
    'b': { matchRate: 0.5, gameRate: 0.25 },
    'c': { matchRate: 0.0, gameRate: NaN  },
    'd': { matchRate: NaN, gameRate: 0.0  },
  }
  const opps = p => Object.keys(sampleData).filter(o => o !== p);

  it('mutates input', () => {
    const result = { other: 'pass' };
    expect(calcOpps(result, {}, [])).toBe(result)
    expect(result).toHaveProperty('other','pass')
  })
  it('works with no opps', () => {
    expect(calcOpps({}, sampleData)).toEqual({oppMatch: [NaN], oppGame: [NaN]})
  })
  it('works with no data', () => {
    expect(calcOpps({}, {}, opps())).toEqual({oppMatch: [NaN], oppGame: [NaN]})
  })

  it('gets oppMatch', () => {
    expect(calcOpps({}, sampleData, ['a']).oppMatch[0]).toBeCloseTo(1.0)
    expect(calcOpps({}, sampleData, ['b']).oppMatch[0]).toBeCloseTo(0.5)
    expect(calcOpps({}, sampleData, ['c']).oppMatch[0]).toBeCloseTo(0.0)
    expect(calcOpps({}, sampleData, ['d']).oppMatch[0]).toBe(NaN)
  })
  it('gets oppGame', () => {
    expect(calcOpps({}, sampleData, ['a']).oppGame[0]).toBeCloseTo(0.75)
    expect(calcOpps({}, sampleData, ['b']).oppGame[0]).toBeCloseTo(0.25)
    expect(calcOpps({}, sampleData, ['c']).oppGame[0]).toBe(NaN)
    expect(calcOpps({}, sampleData, ['d']).oppGame[0]).toBeCloseTo(0.0)
  })

  it('averages oppMatches', () => {
    expect(calcOpps({}, sampleData, opps('a')).oppMatch[0]).toBeCloseTo(0.5 / 2)
    expect(calcOpps({}, sampleData, opps('b')).oppMatch[0]).toBeCloseTo(1.0 / 2)
    expect(calcOpps({}, sampleData, opps('c')).oppMatch[0]).toBeCloseTo(1.5 / 2)
    expect(calcOpps({}, sampleData, opps('d')).oppMatch[0]).toBeCloseTo(1.5 / 3)
  })
  it('averages oppGames', () => {
    expect(calcOpps({}, sampleData, opps('a')).oppGame[0]).toBeCloseTo(0.25 / 2)
    expect(calcOpps({}, sampleData, opps('b')).oppGame[0]).toBeCloseTo(0.75 / 2)
    expect(calcOpps({}, sampleData, opps('c')).oppGame[0]).toBeCloseTo(1.0  / 3)
    expect(calcOpps({}, sampleData, opps('d')).oppGame[0]).toBeCloseTo(1.0  / 2)
  })
})


// ---- STATS COMBINERS / FINALIZER ---- // 

describe('combineStats', () => {
  const baseObj = { matchRecord: [], gameRecord: [], matchScore: 0, gameScore: 0 }
  const combined = combineStats({
    matchRecord: [1,2,3], gameRecord: [2,4,6], matchScore: 6, gameScore: 12,
  },{
    matchRecord: [5,3,1], gameRecord: [7,3,2], matchScore: 16, gameScore: 23,
  })

  it('mutates first arg', () => {
    const a = { ...baseObj, other: 'a' };
    expect(combineStats(a, {...baseObj})).toBe(a)
    expect(a).toHaveProperty('other','a')
  })
  it('matchRecord', () => expect(combined).toHaveProperty('matchRecord', [6,5,4]))
  it('gameRecord',  () => expect(combined).toHaveProperty('gameRecord',  [9,7,8]))
  it('matchScore',  () => expect(combined).toHaveProperty('matchScore',  22))
  it('gameScore',   () => expect(combined).toHaveProperty('gameScore',   35))
})


describe('combineFinal', () => {
  let combined, dataA, dataB;

  // Setup spy to bypass combineStats
  const comboSpy = jest.spyOn(statUtil,'combineStats');
  afterAll(() => comboSpy.mockRestore())
  
  beforeEach(() => {
    comboSpy.mockImplementationOnce(a => a)
    dataA = { eventids: ['d1','d2'], oppMatch: [2, 4], oppGame: [11, 12], passthrough: true }
    dataB = { eventids: ['d3'],      oppMatch: [6],    oppGame: [ NaN ]  }

    combined = combineFinal(dataA, dataB)
  })

  it('mutates first arg', () => {
    expect(combined).toBe(dataA)
    expect(combined).toHaveProperty('passthrough',true)
    dataA.other = 'fin';
    expect(combined).toHaveProperty('other','fin')
  })
  it('uses combineStats', () => {
    expect(comboSpy).toBeCalledTimes(1)
    expect(comboSpy).toBeCalledWith(dataA,dataB)
  })
  
  it('eventids', () => expect(combined).toHaveProperty('eventids', ['d1','d2','d3']))
  it('oppMatch', () => expect(combined).toHaveProperty('oppMatch', [2, 4, 6]))
  it('oppGame',  () => expect(combined).toHaveProperty('oppGame',  [11, 12, NaN]))
})


describe('finalize', () => {
  // Setup spy to bypass calcRates
  const rateSpy = jest.spyOn(statUtil,'calcRates');
  afterAll(() => rateSpy.mockRestore())

  let comboResult, finalized;
  beforeEach(() => {
    comboResult = {
      eventids: ['d1'], passthrough: true,
      oppMatch: [0.0, 0.5, NaN], oppGame: [0.75, 0.25, NaN],
    }
    finalized = finalize(comboResult)
  })

  it('mutates input', () => {
    expect(finalized).toBe(comboResult)
    expect(finalized).toHaveProperty('passthrough',true)
    comboResult.other = 'input';
    expect(finalized).toHaveProperty('other','input')
  })
  it('skip finalize rates if only 1 event', () => {
    expect(rateSpy).toBeCalledTimes(0)
  })
  it('finalizes rates using calcRates', () => {
    rateSpy.mockImplementationOnce(r => r)
    comboResult = { eventids: ['d1','d2','d3'], oppMatch: [1], oppGame: [1] }
    finalize(comboResult)
    expect(rateSpy).toBeCalledTimes(1)
    expect(rateSpy).toBeCalledWith(comboResult)
  })

  it('finalizes oppo rates', () => {
    expect(finalized.oppMatch).toBeCloseTo(0.5 / 2)
    expect(finalized.oppGame).toBeCloseTo(1.0 / 2)
  })
})


// ---- RANKINGS SORTER ---- // 

describe('rankSort', () => {
  const sampleData = {
    // base
    a1: { 
      matchScore: 6, matchRate: 0.5, gameRate: 0.25,
      oppMatch: 0.5, oppGame: 0.75
    },
    // a1 > a2 (oppMatch)
    a2: {
      matchScore: 6, matchRate: 0.5, gameRate: 0.25,
      oppMatch: 0.25, oppGame: 0.75
    },
    // a2 > a3 (oppGame)
    a3: {
      matchScore: 6, matchRate: 0.5, gameRate: 0.25,
      oppMatch: 0.25, oppGame: 0.5
    },
    // b1 > a1 (match[Score|Rate])
    b1: {
      matchScore: 7, matchRate: 0.75, gameRate: 0.5,
      oppMatch: 0.25, oppGame: 0.5
    },
    // b1 > b2 (gameRate)
    // if !useMatchScore: b2 > b1 (matchRate)
    b2: {
      matchScore: 7, matchRate: 0.8, gameRate: 0.35,
      oppMatch: 0.25, oppGame: 0.5
    },
    // b3 == b2
    b3: {
      matchScore: 7, matchRate: 0.8, gameRate: 0.35,
      oppMatch: 0.25, oppGame: 0.5
    },
  }

  it('same players', () => {
    expect(rankSort(sampleData)('a1','a1')).toBe(0)
  })
  it('matchScore', () => {
    expect(rankSort(sampleData)('b1','a1')).toBeLessThan(0)
    expect(rankSort(sampleData)('a1','b1')).toBeGreaterThan(0)
  })
  it('oppMatchRate', () => {
    expect(rankSort(sampleData)('a1','a2')).toBeLessThan(0)
    expect(rankSort(sampleData)('a2','a1')).toBeGreaterThan(0)
  })
  it('gameRate', () => {
    expect(rankSort(sampleData,null,true)('b1','b2')).toBeLessThan(0)
    expect(rankSort(sampleData,null,true)('b2','b1')).toBeGreaterThan(0)
  })
  it('matchRate', () => {
    // Should reverse order of above test
    expect(rankSort(sampleData,null,false)('b1','b2')).toBeGreaterThan(0)
    expect(rankSort(sampleData,null,false)('b2','b1')).toBeLessThan(0)
  })
  it('oppGameRate', () => {
    expect(rankSort(sampleData)('a2','a3')).toBeLessThan(0)
    expect(rankSort(sampleData)('a3','a2')).toBeGreaterThan(0)
  })
  it('originalOrder', () => {
    expect(rankSort(sampleData,['b2','b3'])('b2','b3')).toBeLessThan(0)
    expect(rankSort(sampleData,['b2','b3'])('b3','b2')).toBeGreaterThan(0)
    expect(rankSort(sampleData,['b3','b2'])('b2','b3')).toBeGreaterThan(0)
    expect(rankSort(sampleData,['b3','b2'])('b3','b2')).toBeLessThan(0)
  })
  it('reverse-alphabetical to tie break', () => {
    expect(rankSort(sampleData)('b2','b3')).toBeGreaterThan(0)
    expect(rankSort(sampleData)('b3','b2')).toBeLessThan(0)
  })

  it('works as sorter', () => {
    const unsortedKeys = ['b3','a3','a2','b1','b2','a1']
    expect(unsortedKeys.sort(rankSort(sampleData)))
      .toEqual(['b3','b2','b1','a1','a2','a3'])
    expect(unsortedKeys.sort(rankSort(sampleData, ['b2','b3'])))
      .toEqual(['b2','b3','b1','a1','a2','a3'])
    expect(unsortedKeys.sort(rankSort(sampleData, ['b2','b3'], true)))
      .toEqual(['b1','b2','b3','a1','a2','a3'])
  })

  it('missing data', () => {
    expect(rankSort()('b2','b3')).toBeGreaterThan(0)
    expect(rankSort()('b3','b2')).toBeLessThan(0)
    expect(rankSort({b2:{},b3:{}},0,0)('b2','b3')).toBeGreaterThan(0)
    expect(rankSort({b2:{},b3:{}},0,1)('b3','b2')).toBeLessThan(0)
    expect(rankSort({b2:{}})('b2','b3')).toBeLessThan(0)
    expect(rankSort({b3:{}})('b2','b3')).toBeGreaterThan(0)
  })
  it('players missing from originalOrder', () => {
    expect(rankSort(0,[])('b2','b3')).toBeGreaterThan(0)
    expect(rankSort(0,[])('b3','b2')).toBeLessThan(0)
    expect(rankSort(0,['b3'])('b2','b3')).toBeGreaterThan(0)
    expect(rankSort(0,['b2'])('b2','b3')).toBeLessThan(0)
  })
})