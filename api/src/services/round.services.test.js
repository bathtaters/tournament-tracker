// Import
const round = require('./round.services')

// Mock stats 'ranking'
const toStats = require('./stats.services')
jest.mock('./stats.services', () => jest.fn((_,ranking) => ({ ranking })))

// Mock array 'denester'
const matchGen = require('./matchGenerators/swissMonrad')
jest.mock('./matchGenerators/swissMonrad')


describe('new round', () => {
  let eventData
  const matchGenResult = [['a','b'],['c','d'],['e']]

  beforeAll(() => { matchGen.mockImplementation(()=>matchGenResult) })
  afterAll(() => { matchGen.mockRestore() })
  
  beforeEach(() => {
    eventData = {
      id: 'd1',
      roundactive: 1,
      roundcount: 3,
      wincount: 2,
      players: ['a','b','c','d','e'],
    }
  })

  // EventId & Round
  it('always returns event/round', () => {
    const full = round(eventData);
    expect(full).toHaveProperty('eventid', 'd1')
    expect(full).toHaveProperty('round')
    
    const part = round({...eventData, roundactive:4});
    expect(part).toHaveProperty('eventid', 'd1')
    expect(part).toHaveProperty('round')
  })
  it('always increment round', () => {
    expect(round(eventData)).toHaveProperty('round', 2)
    expect(round({...eventData, roundactive: 3})).toHaveProperty('round', 4)
    expect(round({...eventData, roundactive: 0})).toHaveProperty('round', 1)
  })
  it('round doesn\'t go past count+1', () => {
    expect(round({...eventData, roundactive: 4})).toHaveProperty('round', 4)
    expect(round({...eventData, roundactive: 9})).toHaveProperty('round', 4)
  })

  // Matches Array
  it('returns matches array', () => {
    expect(round(eventData)).toHaveProperty('matches')
  })
  it('no matches array if event is over', () => {
    expect(round({...eventData, roundactive: 4})).not.toHaveProperty('matches')
    expect(round({...eventData, roundactive: 9})).not.toHaveProperty('matches')
  })
  it('matches array is length of matchGen result', () => {
    expect(round(eventData).matches.length).toBe(3)
    matchGen.mockImplementationOnce(() => [[],[],[],[],[]])
    expect(round(eventData).matches.length).toBe(5)
  })
  it('each match has round & eventid', () => {
    const result = round(eventData);
    result.matches.forEach(match => {
      expect(match).toHaveProperty('eventid', 'd1')
      expect(match).toHaveProperty('round', result.round)
    })
  })
  it('each match has players, wins & reported props', () => {
    round(eventData, null, null, false).matches.forEach((match,i) => {
      expect(match).toHaveProperty('players', matchGenResult[i])
      expect(match).toHaveProperty('wins', i != 2 ? [0,0] : [0])
      expect(match).toHaveProperty('reported', false)
    })
  })

  // Auto-Report Byes
  it('auto-reports byes when true', () => {
    round(eventData, null, null, true).matches.forEach((match,i) => {
      expect(match).toHaveProperty('wins', i != 2 ? [0,0] : [2])
      expect(match).toHaveProperty('reported', i != 2 ? false : true)
    })
  })

  // MatchGen
  it('uses matchGen to generate matches', () => {
    round(eventData)
    expect(matchGen).toBeCalledTimes(1)
    expect(matchGen).toBeCalledWith(
      { ranking: eventData.players },
      {...eventData, oppData: undefined}
    )
  })
  it('passes noStats to matchGen on first round', () => {
    eventData.roundactive = 0
    round(eventData)
    expect(matchGen).toBeCalledTimes(1)
    expect(matchGen).toBeCalledWith(
      { ranking: eventData.players, noStats: true },
      {...eventData, oppData: undefined}
    )
  })

  // Edge case
  it('works w/o players', () => {
    matchGen.mockImplementationOnce(() => []).mockImplementationOnce(() => [])

    expect(round({...eventData, players: null, round: 0})).toHaveProperty('matches',[])
    expect(matchGen).toHaveBeenNthCalledWith(1, {ranking: []}, expect.anything())
    
    expect(round({...eventData, players: null })).toHaveProperty('matches',[])
    expect(matchGen).toHaveBeenNthCalledWith(2, {ranking: []}, expect.anything())
    expect(matchGen).toBeCalledTimes(2)
  })

  // Drops
  it('drops players in drops array', () => {
    round({...eventData, drops: ['d','b']})
    expect(matchGen).toBeCalledWith({ ranking: [
      expect.stringMatching(/^[ace]$/),
      expect.stringMatching(/^[ace]$/),
      expect.stringMatching(/^[ace]$/),
    ] }, expect.anything())
  })

  // toStats
  it('skip toStats for 1st round', () => {
    eventData.roundactive = 0
    round(eventData)
    expect(toStats).toBeCalledTimes(0)
  })
  it('use toStats for other rounds', () => {
    round(eventData, 'matches', 'opps')
    expect(toStats).toBeCalledTimes(1)
    expect(toStats).toBeCalledWith(
      { solo: 'matches' },
      eventData.players,
      { solo: 'opps' },
      true
    )
  })

})