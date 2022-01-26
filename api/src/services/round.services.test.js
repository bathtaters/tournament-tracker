// Import & Mocks
const util = require('../utils/shared.utils')
const arrToObjSpy = jest.spyOn(util,'arrToObj')
const round = require('./round.services')

// Mock stats 'ranking'
const toStats = require('./stats.services')
jest.mock('./stats.services', () => 
  jest.fn((_,players) => ({ ranking: players }))
)

// Mock array 'denester'
const swissMonrad = require('./matchGenerators/swissMonrad')
jest.mock('./matchGenerators/swissMonrad', () => jest.fn(
  list => list.reduce((a,p,i) => {
    i % 2 ? a[a.length-1].push(p) : a.push([p])
    return a
  }, [])
))


describe('new round', () => {
  let draftData;

  // Generate match array for result
  const getMatchArray = (data, reportByes = false) =>
    swissMonrad(data.players).map(m => ({
      draftId: data.id, round: data.roundactive + 1,
      reported: reportByes && m.length === 1,
      players: m.length === 1 ? 
        { [m[0]]: reportByes ? 2 : 0 } : 
        { [m[0]]: 0, [m[1]]: 0 }
    }))

  beforeAll(() => { arrToObjSpy.mockImplementation(()=>()=>{}) })
  afterAll(() => { arrToObjSpy.mockRestore() })
  
  beforeEach(() => {
    draftData = {
      id: 'd1',
      roundactive: 1,
      roundcount: 3,
      bestof: 3,
      players: ['a','b','c','d'],
    }
  })

  it('returns base & matches array', () => {
    expect(round({ draftData }, false)).toEqual({
      draftId: 'd1',
      round: 2,
      matches: getMatchArray(draftData)
    })
  })

  it('only returns base if draft ends', () => {
    draftData.roundactive = 2
    expect(round({ draftData })).toEqual({draftId: 'd1', round: 3})
    draftData.roundactive = 5
    expect(round({ draftData })).toEqual({draftId: 'd1', round: 3})
  })

  it('uses Swiss Monrad to make matchTable', () => {
    arrToObjSpy.mockImplementationOnce(()=>()=>'opps')
    round({ draftData }, false)
    expect(swissMonrad).toBeCalledTimes(1)
    expect(swissMonrad).toBeCalledWith(draftData.players, {...draftData, oppData: 'opps'})
    expect(arrToObjSpy).toBeCalledTimes(1)
  })

  it('drops players in drops array', () => {
    expect(round({ draftData, drops: ['d','b'] }, false)).toEqual({
      draftId: 'd1',
      round: 2,
      matches: getMatchArray({...draftData, players: ['a','c']})
    })
  })

  it('calls toStats when not 1st round', () => {
    round({ draftData, stats: 'brkrs' }, false)
    expect(toStats).toBeCalledTimes(1)
    expect(toStats).toBeCalledWith('brkrs', draftData.players)
  })
  it('skips toStats for 1st round', () => {
    draftData.roundactive = 0
    round({ draftData, stats: 'brkrs' }, false)
    expect(toStats).toBeCalledTimes(0)
  })

  it('does auto-report byes when true', () => {
    draftData.players.push('e')
    expect(round({ draftData }, true)).toEqual({
      draftId: 'd1',
      round: 2,
      matches: getMatchArray(draftData, true)
    })
  })
  it('doesn\'t auto-report byes when false', () => {
    draftData.players.push('e')
    expect(round({ draftData }, false)).toEqual({
      draftId: 'd1',
      round: 2,
      matches: getMatchArray(draftData, false)
    })
  })

  it('gets opp data from statsObj', () => {
    const arrToObjFn = jest.fn(()=>'opps')
    arrToObjSpy.mockImplementationOnce(()=>arrToObjFn)
    round({ draftData, stats: 'brkrs' })

    expect(arrToObjFn).toBeCalledTimes(1)
    expect(arrToObjFn).toBeCalledWith('brkrs')
    expect(swissMonrad).toBeCalledTimes(1)
    expect(swissMonrad).toBeCalledWith(draftData.players, {...draftData, oppData:'opps'})
  })
})