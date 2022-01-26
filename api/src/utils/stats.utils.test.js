// Import test functions
const resultCalc = require('./stats.utils');
const {
  record, score, rate,
  average, combine, finalize,
  calcAll, rankSort
} = resultCalc;

// Force to use these constants
jest.mock('../config/constants.json', () => ({
  points: { win: 3, draw: 1, floor: 0.33 }
}));


// ---- GET W/L/D RECORD ---- // 

describe('record', () => {
  it('works', () => {
    expect(record(1,3,6)).toEqual([1,2,3])
    expect(record(1,0,1)).toEqual([1,0,0])
    expect(record(0,0,1)).toEqual([0,1,0])
    expect(record(0,1,1)).toEqual([0,0,1])
  })
  it('allows missing params', () => {
    expect(record()).toEqual([0,0,0])
  })
})


// ---- GET SCORE ---- // 

describe('score', () => {

  it('works', () => {
    expect(score(2,3)).toBe((2*3) + (3*1))
    expect(score(1,0)).toBe(3)
    expect(score(0,1)).toBe(1)
    expect(score(0,0)).toBe(0)
  })
  it('allows missing params', () => {
    expect(score()).toBe(0)
  })
})


// ---- GET WIN % ---- // 

describe('rate', () => {
  // Uses un-mocked 'score'

  it('works', () => {
    expect(rate(1,1,3)).toBeCloseTo((1 + (1/3)) / 3)
    expect(rate(1,0,1)).toBeCloseTo(1)
    expect(rate(0,1,1)).toBeCloseTo(1/3)
    expect(rate(0,0,1)).toBeCloseTo(0.33)
    expect(rate(0,0,0)).toBe(1)
  })
  it('allows missing params', () => {
    expect(rate()).toBe(1)
  })
})


// ---- GET AVERAGES ---- // 

describe('average', () => {
  // Uses un-mocked 'rate' (Which uses unmocked 'score')

  it('works', () => {
    expect(average('r',[
      {rwins: 0, rdraws: 0, rcount: 1}, // 0.33
      {rwins: 0, rdraws: 0, rcount: 4}, // 0.33
    ])).toBeCloseTo(0.33)

    expect(average('s',[
      {swins: 1, sdraws: 0, scount: 2}, // 0.5
      {swins: 2, sdraws: 0, scount: 4}, // 0.5
      {swins: 3, sdraws: 0, scount: 6}, // 0.5
    ])).toBeCloseTo(0.5)

    expect(average('t',[
      {twins: 1, tdraws: 0, tcount: 1}, // 1.0
      {twins: 2, tdraws: 0, tcount: 2}, // 1.0
      {twins: 3, tdraws: 0, tcount: 3}, // 1.0
      {twins: 4, tdraws: 0, tcount: 4}, // 1.0
    ])).toBeCloseTo(1.0)

    expect(average('t',[
      {twins: 0, tdraws: 0, tcount: 1}, // 0.33
      {twins: 1, tdraws: 0, tcount: 2}, // 0.5
      {twins: 1, tdraws: 3, tcount: 3}, // 0.66
    ])).toBeCloseTo(0.5)
    
    expect(average('t',[
      {twins: 1, tdraws: 1, tcount: 3},
      {twins: 1, tdraws: 1, tcount: 3},
    ])).toBeCloseTo((1 + (1/3)) / 3)
  })
  it('allows empty array', () => {
    expect(average('t',[])).toBe(0)
  })
})


// ---- STATS CALC ---- // 

describe('calcAll', () => {
  const spies = {
    record: jest.spyOn(resultCalc,'record'),
    score:  jest.spyOn(resultCalc,'score'),
    rate:   jest.spyOn(resultCalc,'rate'),
    avg:    jest.spyOn(resultCalc,'average'),
  }
  // Mock this many spy calls for each
  const mockCount = 2;

  beforeEach(() => {
    Object.keys(spies).forEach(s => 
      [...Array(mockCount)].forEach((_,i) => 
        // Mock returns 'keyString' + callCount
        spies[s].mockImplementationOnce(() => s+(i+1))
      )
    );
  })

  afterAll(() => Object.keys(spies).forEach(s => spies[s].mockRestore()))

  it('calls correct methods', () => {
    const oppos = [{
      matchwins: 11,
      matchdraws: 12,
      matchcount: 13,
      gamewins: 14,
      gamedraws: 15,
      gamecount: 16,
    }];

    expect(calcAll({
      draftid: 'd1',
      matchwins: 1,
      matchdraws: 2,
      matchcount: 3,
      gamewins: 4,
      gamedraws: 5,
      gamecount: 6
    }, oppos)).toEqual({
      draftIds:  ['d1'],
      matches:   'record1',
      matchScore:'score1',
      matchRate: 'rate1',
      games:     'record2',
      gameScore: 'score2',
      gameRate:  'rate2',
      oppMatch:  'avg1',
      oppGame:   'avg2',
    })
    
    Object.keys(spies).forEach(s => expect(spies[s]).toBeCalledTimes(mockCount))

    expect(spies.record).toHaveBeenNthCalledWith(1, 1,2,3)
    expect(spies.record).toHaveBeenNthCalledWith(2, 4,5,6)

    expect(spies.score).toHaveBeenNthCalledWith(1, 1,2)
    expect(spies.score).toHaveBeenNthCalledWith(2, 4,5)

    expect(spies.rate).toHaveBeenNthCalledWith(1, 1,2,3)
    expect(spies.rate).toHaveBeenNthCalledWith(2, 4,5,6)

    expect(spies.avg).toHaveBeenNthCalledWith(1, 'match',oppos)
    expect(spies.avg).toHaveBeenNthCalledWith(2, 'game', oppos)
  })
})


// ---- STATS COMBINER ---- // 

describe('combine + finalize', () => {
  const sampleA = {
    draftIds: ['a1','a2'],
    matches: [1,0,3],
    matchScore: 6,
    matchRate: 0.5,
    games: [3,2,1],
    gameScore: 10,
    gameRate: 0.25,
    oppMatch: 0.5,
    oppGame: 0.75
  }
  const sampleB = {
    draftIds: ['b1'],
    matches: [2,1,1],
    matchScore: 7,
    matchRate: 0.75,
    games: [1,4,3],
    gameScore: 6,
    gameRate: 0.5,
    oppMatch: 0.25,
    oppGame: 0.5
  }

  const comboResult = combine(sampleA,sampleB)
  const finalized = finalize(comboResult)

  it('combines draftIds', () => {
    expect(comboResult).toHaveProperty('draftIds',['a1','a2','b1'])
  })
  it('combines records', () => {
    expect(comboResult).toHaveProperty('matches',[3,1,4])
    expect(comboResult).toHaveProperty('games',[4,6,4])
  })
  it('combines scores', () => {
    expect(comboResult).toHaveProperty('matchScore',13)
    expect(comboResult).toHaveProperty('gameScore',16)
  })
  it('combines rates', () => {
    expect(comboResult).toHaveProperty('matchRate',1.25)
    expect(comboResult).toHaveProperty('gameRate',0.75)
  })
  it('combines oppo rates', () => {
    expect(comboResult).toHaveProperty('oppMatch',0.75)
    expect(comboResult).toHaveProperty('oppGame',1.25)
  })
  it('includes avgCounter', () => {
    expect(comboResult).toHaveProperty('avgCounter',2)
  })

  it('finalize clears avgCounter', () => {
    expect(finalized).not.toHaveProperty('avgCounter')
  })
  it('finalizes basic results', () => {
    expect(finalized).toEqual({
      draftIds: ['a1','a2','b1'],
      matches: [3,1,4],
      games: [4,6,4],
      matchScore: 13,
      gameScore: 16,
      matchRate: expect.anything(),
      gameRate: expect.anything(),
      oppMatch: expect.anything(),
      oppGame: expect.anything(),
    })
  })
  it('finalizes rates', () => {
    expect(finalized.matchRate).toBeCloseTo(0.5417)
    expect(finalized.gameRate).toBeCloseTo(0.3809)
  })
  it('finalizes oppo rates', () => {
    expect(finalized.oppMatch).toBeCloseTo(0.375)
    expect(finalized.oppGame).toBeCloseTo(0.625)
  })
})


// ---- RANKINGS SORTER ---- // 

describe('rankSort', () => {
  const sampleData = {
    // base
    a1: { 
      matchScore: 6,
      matchRate: 0.5,
      gameRate: 0.25,
      oppMatch: 0.5,
      oppGame: 0.75
    },
    // a1 > a2 (oppMatch)
    a2: {
      matchScore: 6,
      matchRate: 0.5,
      gameRate: 0.25,
      oppMatch: 0.25,
      oppGame: 0.75
    },
    // a2 > a3 (oppGame)
    a3: {
      matchScore: 6,
      matchRate: 0.5,
      gameRate: 0.25,
      oppMatch: 0.25,
      oppGame: 0.5
    },
    // b1 > a1 (match[Score|Rate])
    b1: {
      matchScore: 7,
      matchRate: 0.75,
      gameRate: 0.5,
      oppMatch: 0.25,
      oppGame: 0.5
    },
    // b1 > b2 (gameRate)
    // if !useMatchScore: b2 > b1 (matchRate)
    b2: {
      matchScore: 7,
      matchRate: 0.8,
      gameRate: 0.35,
      oppMatch: 0.25,
      oppGame: 0.5
    },
    // b3 == b2
    b3: {
      matchScore: 7,
      matchRate: 0.8,
      gameRate: 0.35,
      oppMatch: 0.25,
      oppGame: 0.5
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
})