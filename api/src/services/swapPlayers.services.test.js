// Import
const swapPlayers = require('./swapPlayers.services')

describe('swapPlayersService', () => {
  let swaps, matches

  beforeEach(() => {
    swaps = [ { playerId: 'c' }, { playerId: 'b' } ]
    matches = [
      { id: 'm1', players: ['a','c'], wins: [1, 3], drops: ['a'] },
      { id: 'm2', players: ['b','d'], wins: [2, 4], drops: ['b'] },
    ]
  })

  it('swaps players', () => {
    expect(swapPlayers(matches, swaps)).toEqual([
      expect.objectContaining({ players: ['a','b'] }),
      expect.objectContaining({ players: ['c','d'] }),
    ])
  })
  it('swaps wins', () => {
    expect(swapPlayers(matches, swaps)).toEqual([
      expect.objectContaining({ wins: [1,2] }),
      expect.objectContaining({ wins: [3,4] }),
    ])
  })
  it('swaps drops', () => {
    expect(swapPlayers(matches, swaps)).toEqual([
      expect.objectContaining({ drops: ['a','b'] }),
      expect.anything(),
    ])
  })
  it('passes idx', () => {
    expect(swapPlayers(matches, swaps)).toEqual([
      expect.objectContaining({ id: 'm1' }),
      expect.objectContaining({ id: 'm2' }),
    ])
  })

  it('leave off drops when not needed', () => {
    expect(swapPlayers(matches, swaps)[1]).not.toHaveProperty('drops')
  })

  it('throws error for missing player', () => {
    swaps[1].playerId = 'a'
    expect(() => swapPlayers(matches, swaps))
      .toThrowError("Player is not registered for match: a")
  })
})