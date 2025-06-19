// Imports & Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const stats = require('./stats.services')
const util = require('../utils/stats.utils')
jest.mock('../utils/stats.utils')

afterAll(() => { warnSpy.mockRestore() })

// Setup Mocks
beforeAll(() => {
  util.getWLD.mockImplementation(({ id }) => 'WLD:'+id)
  util.calcBase.mockImplementation((i,_,m) => [m.id+i])
  util.calcRates.mockImplementation(d => d)
  util.calcOpps.mockImplementation(d => d)
  util.combineStats.mockImplementation((a, b) => a.concat(b))
  util.combineFinal.mockImplementation((a, b) => a.concat(b))
  util.finalize.mockImplementation(d => d)
  util.rankSort.mockImplementation(() => (a,b) => a > b ? 1 : -1)
})

// ---- MAIN ---- //

describe('toStats', () => {
  // Mock Data
  let d1, d2, oppos
  beforeEach(() => {
    d1 = [ 
      { id: '1a', reported: 1, players: ['p1', 'p2'] },
      { id: '1b', reported: 1, players: ['p3', 'p4'] },
    ]
    d2 = [
      { id: '2a', reported: 1, players: ['p1', 'p2'] },
      { id: '2b', reported: 1, players: ['p3', 'p4'] },
      { id: '2c', reported: 1, players: ['p1', 'p2'] },
      { id: '2d', reported: 1, players: ['p3', 'p4'] },
    ]
    oppos = { 
      d1: { p1: 'd1p1', p2: 'd1p2', p3: 'd1p3', p4: 'd1p4' },
      d2: { p1: 'd2p1', p2: 'd2p2', p3: 'd2p3', p4: 'd2p4' },
    }
  })

  // Full Tests
  it('1 event, 1 match', () => {
    const res = { p1: ['1a0'], p2: ['1a1'], p3: ['1b0'], p4: ['1b1'] }
    const result = stats({ d1 }, null, oppos)
    Object.keys(res).forEach(p => expect(result[p]).toEqual(res[p]))
  })
  it('1 event, 2 matches', () => {
    const res = { p1:['2a0','2c0'], p2:['2a1','2c1'], p3:['2b0','2d0'], p4:['2b1','2d1'] }
    const result = stats({ d2 }, null, oppos)
    Object.keys(res).forEach(p => expect(result[p]).toEqual(res[p]))
  })
  it('2 events, 3 matches', () => {
    const res = {
      p1: ['1a0','2a0','2c0'], p2: ['1a1','2a1','2c1'],
      p3: ['1b0','2b0','2d0'], p4: ['1b1','2b1','2d1'],
    }
    const result = stats({ d1, d2 }, null, oppos)
    Object.keys(res).forEach(p => expect(result[p]).toEqual(res[p]))
  })

  it('runs w/o data', () => {
    expect(stats({})).toEqual({ ranking: [] })
  })

  // Spot tests
  it('skips unreported matches', () => {
    d1[1].reported = 0
    const result = stats({ d1 }, 0, oppos)
    expect(result.ranking).toEqual(['p1','p2'])
    expect(Object.keys(result).length).toBe(3)
  })

  it('finalizes stats for all players', () => {
    stats({ d1 }, 0, oppos)
    expect(util.finalize).toHaveBeenCalledTimes(4)
    jest.clearAllMocks()

    stats({ d2 }, 0, oppos)
    expect(util.finalize).toHaveBeenCalledTimes(4)
    jest.clearAllMocks()

    stats({ d1, d2 }, 0, oppos)
    expect(util.finalize).toHaveBeenCalledTimes(4)
  })

  // Ranking
  it('ranks players with rankSort', () => {
    expect(stats({ d1 },0,oppos)).toHaveProperty('ranking', ['p1','p2','p3','p4'])
    d2 = d2.reverse()
    expect(stats({ d2 },0,oppos)).toHaveProperty('ranking', ['p1','p2','p3','p4'])
    expect(util.rankSort).toHaveBeenCalledTimes(2)
  })
  it('passes correct args rankSort', () => {
    const res = stats({ d1 }, ['arg2'], oppos, 'arg3')
    expect(util.rankSort).toHaveBeenCalledTimes(1)
    expect(util.rankSort).toHaveBeenCalledWith(res, ['arg2'], 'arg3')
  })
  it('includes players w/o stats in ranking', () => {
    expect(stats({ d1 }, ['p1','p2','p3','p4','p5','p6'], oppos).ranking)
      .toEqual(['p1','p2','p3','p4','p5','p6'])
  })

  // Combining
  it('combines stats for matches', () => {
    stats({ d1 }, 0, oppos)
    expect(util.combineStats).toHaveBeenCalledTimes(0)
    expect(util.combineFinal).toHaveBeenCalledTimes(0)
    jest.clearAllMocks()

    stats({ d2 }, 0, oppos)
    expect(util.combineStats).toHaveBeenCalledTimes(4)
    expect(util.combineFinal).toHaveBeenCalledTimes(0)
    jest.clearAllMocks()

    stats({ d1, d2 }, 0, oppos)
    expect(util.combineStats).toHaveBeenCalledTimes(4)
    expect(util.combineFinal).toHaveBeenCalledTimes(4)
  })
  it('passes correct args to combiners', () => {
    const res = stats({ d1, d2 }, 0, oppos)
    expect(util.combineStats).toHaveBeenNthCalledWith(1, ['2a0'], ['2c0'])
    expect(util.combineStats).toHaveBeenNthCalledWith(2, ['2a1'], ['2c1'])
    expect(util.combineStats).toHaveBeenNthCalledWith(3, ['2b0'], ['2d0'])
    expect(util.combineStats).toHaveBeenNthCalledWith(4, ['2b1'], ['2d1'])
    expect(util.combineFinal).toHaveBeenNthCalledWith(1, ['1a0'], ['2a0','2c0'])
    expect(util.combineFinal).toHaveBeenNthCalledWith(2, ['1a1'], ['2a1','2c1'])
    expect(util.combineFinal).toHaveBeenNthCalledWith(3, ['1b0'], ['2b0','2d0'])
    expect(util.combineFinal).toHaveBeenNthCalledWith(4, ['1b1'], ['2b1','2d1'])
  })

  // Calculating
  it('gets stats for all matches', () => {
    stats({ d1 }, 0, oppos)
    expect(util.getWLD).toHaveBeenCalledTimes(2)
    expect(util.calcBase).toHaveBeenCalledTimes(4)
    expect(util.calcRates).toHaveBeenCalledTimes(4)
    expect(util.calcOpps).toHaveBeenCalledTimes(4)
    jest.clearAllMocks()

    stats({ d2 }, 0, oppos)
    expect(util.getWLD).toHaveBeenCalledTimes(4)
    expect(util.calcBase).toHaveBeenCalledTimes(8)
    expect(util.calcRates).toHaveBeenCalledTimes(4)
    expect(util.calcOpps).toHaveBeenCalledTimes(4)
    jest.clearAllMocks()

    stats({ d1, d2 }, 0, oppos)
    expect(util.getWLD).toHaveBeenCalledTimes(6)
    expect(util.calcBase).toHaveBeenCalledTimes(12)
    expect(util.calcRates).toHaveBeenCalledTimes(8)
    expect(util.calcOpps).toHaveBeenCalledTimes(8)
  })
  it('passes correct args to calcs', () => {
    const res = stats({ d1 }, 0, oppos, true, 'floor')
    expect(util.getWLD).toHaveBeenNthCalledWith(1, d1[0])
    expect(util.getWLD).toHaveBeenNthCalledWith(2, d1[1])

    expect(util.calcBase).toHaveBeenNthCalledWith(1, 0, 'WLD:1a', d1[0], 'd1')
    expect(util.calcBase).toHaveBeenNthCalledWith(2, 1, 'WLD:1a', d1[0], 'd1')
    expect(util.calcBase).toHaveBeenNthCalledWith(3, 0, 'WLD:1b', d1[1], 'd1')
    expect(util.calcBase).toHaveBeenNthCalledWith(4, 1, 'WLD:1b', d1[1], 'd1')

    expect(util.calcRates).toHaveBeenNthCalledWith(1, ['1a0'], 'floor')
    expect(util.calcRates).toHaveBeenNthCalledWith(2, ['1a1'], 'floor')
    expect(util.calcRates).toHaveBeenNthCalledWith(3, ['1b0'], 'floor')
    expect(util.calcRates).toHaveBeenNthCalledWith(4, ['1b1'], 'floor')

    delete res.ranking; // Opps called before ranking added
    expect(util.calcOpps).toHaveBeenNthCalledWith(1,  ['1a0'], res, 'd1p1')
    expect(util.calcOpps).toHaveBeenNthCalledWith(2,  ['1a1'], res, 'd1p2')
    expect(util.calcOpps).toHaveBeenNthCalledWith(3,  ['1b0'], res, 'd1p3')
    expect(util.calcOpps).toHaveBeenNthCalledWith(4,  ['1b1'], res, 'd1p4')
  })
  it('passes correct args to finalize', () => {
    const res = stats({ d1 }, 0, oppos, true, 'floor')
    expect(util.finalize).toHaveBeenCalledTimes(4)
    expect(util.finalize).toHaveBeenNthCalledWith(1, ['1a0'], 'floor')
    expect(util.finalize).toHaveBeenNthCalledWith(2, ['1a1'], 'floor')
    expect(util.finalize).toHaveBeenNthCalledWith(3, ['1b0'], 'floor')
    expect(util.finalize).toHaveBeenNthCalledWith(4, ['1b1'], 'floor')
  })
})