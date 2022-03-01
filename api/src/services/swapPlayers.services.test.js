// Import
const swapPlayers = require('./swapPlayers.services')

describe('swapPlayersService', () => {
  let swaps, matches

  beforeEach(() => {
    swaps = [ { playerid: 'c' }, { playerid: 'b' } ]
    matches = [
      { id: 'm1', players: ['a','c'], wins: [1, 3], drops: ['a'], reported: true },
      { id: 'm2', players: ['b','d'], wins: [2, 4], drops: ['b'], reported: true },
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

  it('clear drops from unreported match', () => {
    matches[1].reported = false
    expect(swapPlayers(matches, swaps)[1]).toHaveProperty('drops', [])
  })

  it('throws error for missing player', () => {
    swaps[1].playerid = 'a'
    expect(() => swapPlayers(matches, swaps))
      .toThrowError("Player is not registered for match: a")
  })
})