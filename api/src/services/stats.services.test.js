// Imports & Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const stats = require('./stats.services')
const util = require('../utils/stats.utils')
jest.mock('../utils/stats.utils')

afterAll(() => { warnSpy.mockRestore() })


// Helpers
const addOppos = (draft, oppIds) => draft.map(d =>
  Object.assign(d, { oppids: oppIds[d.playerid] })
)
const filterData = ({playerid,draftid}) => ({playerid,draftid});
const combineData = (a, b) => ({
  playerid: a.playerid || b.playerid,
  draftid: a.draftid+','+b.draftid,
  avgCounter: true
})


// ---- MAIN ---- //

describe('toStats', () => {
  // Mock Data
  let sampleA, sampleB, oppos
  beforeEach(() => {
    sampleA = [
      { playerid: 'p1', draftid: 'd1' },
      { playerid: 'p2', draftid: 'd1' },
      { playerid: 'p3', draftid: 'd1' },
      { playerid: 'p4', draftid: 'd1' },
    ]
    sampleB = [
      { playerid: 'p1', draftid: 'd2' },
      { playerid: 'p2', draftid: 'd2' },
      { playerid: 'p3', draftid: 'd2' },
      { playerid: 'p4', draftid: 'd2' },
    ]
    oppos = {
      p1: ['p2','p3'], p2: ['p3','p4'],
      p3: ['p4','p1'], p4: ['p1','p2'],
    }
  })

  // Setup Mocks
  beforeAll(() => {
    util.calcAll.mockImplementation(filterData)
    util.finalize.mockImplementation(filterData)
    util.rankSort.mockImplementation(() => (a,b) => a > b ? 1 : -1)
    util.combine.mockImplementation(combineData)
  })

  // Full Tests
  it('single draft w/o opponents', () => {
    const sample = [...sampleA]
    const result = {
      p1: { playerid: 'p1', draftid: 'd1' },
      p2: { playerid: 'p2', draftid: 'd1' },
      p3: { playerid: 'p3', draftid: 'd1' },
      p4: { playerid: 'p4', draftid: 'd1' },
      ranking: expect.anything()
    }
    expect(stats(sampleA)).toEqual(result)
    expect(util.combine).toBeCalledTimes(0)
    expect(util.calcAll).toBeCalledTimes(4);
    ([...Array(4)]).forEach((_,i) =>
      expect(util.calcAll).toHaveBeenNthCalledWith(i+1, sample[i], [])
    );
  })
  it('single draft w/ opponents', () => {
    const sample = addOppos(sampleA, oppos)
    const result = {
      p1: { playerid: 'p1', draftid: 'd1' },
      p2: { playerid: 'p2', draftid: 'd1' },
      p3: { playerid: 'p3', draftid: 'd1' },
      p4: { playerid: 'p4', draftid: 'd1' },
      ranking: expect.anything()
    }
    expect(stats([...sample])).toEqual(result)
    expect(util.combine).toBeCalledTimes(0)
    expect(util.calcAll).toBeCalledTimes(4);
    ([...Array(4)]).forEach((_,i) =>
      expect(util.calcAll).toHaveBeenNthCalledWith(i+1, sample[i], [
        sample[(i+1) % sample.length],
        sample[(i+2) % sample.length]
      ])
    );
  })
  it('multi draft w/o opponents', () => {
    const sample = sampleA.concat(sampleB)
    const result = {
      p1: { playerid: 'p1', draftid: 'd2,d1' },
      p2: { playerid: 'p2', draftid: 'd2,d1' },
      p3: { playerid: 'p3', draftid: 'd2,d1' },
      p4: { playerid: 'p4', draftid: 'd2,d1' },
      ranking: expect.anything()
    }
    expect(stats([...sample])).toEqual(result)

    expect(util.combine).toBeCalledTimes(4);
    ([...Array(4)]).forEach((_,i) =>
      expect(util.combine).toHaveBeenNthCalledWith(i+1,
        { playerid: 'p'+(i+1), draftid: expect.stringMatching(/d[12]/) },
        { playerid: 'p'+(i+1), draftid: expect.stringMatching(/d[12]/) },
      )
    );

    expect(util.calcAll).toBeCalledTimes(8);
    ([...Array(8)]).forEach((_,i) =>
      expect(util.calcAll).toHaveBeenNthCalledWith(i+1, sample[i], [])
    );
  })
  it('multi draft w/ opponents', () => {
    const sample = addOppos(sampleA.concat(sampleB), oppos)
    const result = {
      p1: { playerid: 'p1', draftid: 'd2,d1' },
      p2: { playerid: 'p2', draftid: 'd2,d1' },
      p3: { playerid: 'p3', draftid: 'd2,d1' },
      p4: { playerid: 'p4', draftid: 'd2,d1' },
      ranking: expect.anything()
    }
    expect(stats([...sample])).toEqual(result)
    
    expect(util.combine).toBeCalledTimes(4);
    ([...Array(4)]).forEach((_,i) =>
      expect(util.combine).toHaveBeenNthCalledWith(i+1,
        { playerid: 'p'+(i+1), draftid: expect.stringMatching(/d[12]/) },
        { playerid: 'p'+(i+1), draftid: expect.stringMatching(/d[12]/) },
      )
    );

    expect(util.calcAll).toBeCalledTimes(8);
    ([...Array(8)]).forEach((_,i) =>
      expect(util.calcAll).toHaveBeenNthCalledWith(i+1, sample[i], [
        sample[(i+1) % 4 + (i > 3 ? 4 : 0)],
        sample[(i+2) % 4 + (i > 3 ? 4 : 0)]
      ])
    );
  })
  it('runs w/o data', () => {
    expect(stats([])).toEqual({ ranking: [] })
  })

  // Spot tests
  it('includes player ranking', () => {
    expect(stats(sampleA)).toHaveProperty('ranking', ['p1','p2','p3','p4'])
    expect(stats(sampleA.reverse())).toHaveProperty('ranking', ['p1','p2','p3','p4'])
    expect(util.rankSort).toBeCalledTimes(2)
  })
  it('passes sameTournament & originalOrder to rankSort', () => {
    stats(sampleA, 'arg2', 'arg3')
    expect(util.rankSort).toBeCalledTimes(1)
    expect(util.rankSort).toBeCalledWith(expect.any(Object), 'arg2', 'arg3')
  })

  // Log tests
  it('warn on dupe player/draft', () => {
    warnSpy.mockImplementationOnce(()=>{})
    stats([{playerid:'a',draftid:'b'},{playerid:'a',draftid:'b'}])
    expect(warnSpy).toBeCalledTimes(1)
    expect(warnSpy).toBeCalledWith('Duplicate player-draft data:','a','b')
  })

  it('warn on missing opponent', () => {
    warnSpy.mockImplementationOnce(()=>{})
    stats([{playerid:'a',draftid:'b',oppids:['c']}])
    expect(warnSpy).toBeCalledTimes(1)
    expect(warnSpy).toBeCalledWith('Opponent missing from draftData:','c')
  })
})