// Import
const round = require('./round.services')

// Mock stats 'ranking'
const toStats = require('./stats.services')
jest.mock('./stats.services', () => jest.fn((_,ranking) => ({ ranking })))

// Mock array 'denester'
const matchGen = require('./matchGenerators/swissMonrad')
jest.mock('./matchGenerators/swissMonrad')


describe('new round', () => {
  let draftData
  const matchGenResult = [['a','b'],['c','d'],['e']]

  beforeAll(() => { matchGen.mockImplementation(()=>matchGenResult) })
  afterAll(() => { matchGen.mockRestore() })
  
  beforeEach(() => {
    draftData = {
      id: 'd1',
      roundactive: 1,
      roundcount: 3,
      wincount: 2,
      players: ['a','b','c','d','e'],
    }
  })

  // DraftId & Round
  it('always returns draft/round', () => {
    const full = round(draftData);
    expect(full).toHaveProperty('draftId', 'd1')
    expect(full).toHaveProperty('round')
    
    const part = round({...draftData, roundactive:4});
    expect(part).toHaveProperty('draftId', 'd1')
    expect(part).toHaveProperty('round')
  })
  it('always increment round', () => {
    expect(round(draftData)).toHaveProperty('round', 2)
    expect(round({...draftData, roundactive: 3})).toHaveProperty('round', 4)
    expect(round({...draftData, roundactive: 0})).toHaveProperty('round', 1)
  })
  it('round doesn\'t go past count+1', () => {
    expect(round({...draftData, roundactive: 4})).toHaveProperty('round', 4)
    expect(round({...draftData, roundactive: 9})).toHaveProperty('round', 4)
  })

  // Matches Array
  it('returns matches array', () => {
    expect(round(draftData)).toHaveProperty('matches')
  })
  it('no matches array if draft is over', () => {
    expect(round({...draftData, roundactive: 4})).not.toHaveProperty('matches')
    expect(round({...draftData, roundactive: 9})).not.toHaveProperty('matches')
  })
  it('matches array is length of matchGen result', () => {
    expect(round(draftData).matches.length).toBe(3)
    matchGen.mockImplementationOnce(() => [[],[],[],[],[]])
    expect(round(draftData).matches.length).toBe(5)
  })
  it('each match has round & draftId', () => {
    const result = round(draftData);
    result.matches.forEach(match => {
      expect(match).toHaveProperty('draftId', 'd1')
      expect(match).toHaveProperty('round', result.round)
    })
  })
  it('each match has players, wins & reported props', () => {
    round(draftData, null, null, false).matches.forEach((match,i) => {
      expect(match).toHaveProperty('players', matchGenResult[i])
      expect(match).toHaveProperty('wins', i != 2 ? [0,0] : [0])
      expect(match).toHaveProperty('reported', false)
    })
  })

  // Auto-Report Byes
  it('auto-reports byes when true', () => {
    round(draftData, null, null, true).matches.forEach((match,i) => {
      expect(match).toHaveProperty('wins', i != 2 ? [0,0] : [2])
      expect(match).toHaveProperty('reported', i != 2 ? false : true)
    })
  })

  // MatchGen
  it('uses matchGen to generate matches', () => {
    round(draftData)
    expect(matchGen).toBeCalledTimes(1)
    expect(matchGen).toBeCalledWith(
      draftData.players,
      {...draftData, oppData: undefined}
    )
  })

  // Edge case
  it('works w/o players', () => {
    matchGen.mockImplementationOnce(() => []).mockImplementationOnce(() => [])

    expect(round({...draftData, players: null, round: 0})).toHaveProperty('matches',[])
    expect(matchGen).toHaveBeenNthCalledWith(1, [], expect.anything())
    
    expect(round({...draftData, players: null })).toHaveProperty('matches',[])
    expect(matchGen).toHaveBeenNthCalledWith(2, [], expect.anything())
    expect(matchGen).toBeCalledTimes(2)
  })

  // Drops
  it('drops players in drops array', () => {
    round({...draftData, drops: ['d','b']})
    expect(matchGen).toBeCalledWith([
      expect.stringMatching(/[ace]/),
      expect.stringMatching(/[ace]/),
      expect.stringMatching(/[ace]/),
    ], expect.anything())
  })

  // toStats
  it('skip toStats for 1st round', () => {
    draftData.roundactive = 0
    round(draftData)
    expect(toStats).toBeCalledTimes(0)
  })
  it('use toStats for other rounds', () => {
    round(draftData, 'matches', 'opps')
    expect(toStats).toBeCalledTimes(1)
    expect(toStats).toBeCalledWith(
      { solo: 'matches' },
      draftData.players,
      { solo: 'opps' },
      true
    )
  })

})