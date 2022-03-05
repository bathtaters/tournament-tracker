const swapUtils = require('./swapPlayers.utils')
const { getOtherIdx, updateFilter, swapArrays, moveArrays } = swapUtils

// These are also NOT mocked for swapPlayers.services tests

describe('swapPlayer Utilities', () => {

  describe('getOtherIdx', () => {
    it('gets 0 for 1', () => { expect(getOtherIdx(0)).toBe(1) })
    it('gets 1 for 0', () => { expect(getOtherIdx(1)).toBe(0) })
    // Uncomment to test non quick mode
    // it('works when > 1', () => { expect(getOtherIdx(4)).toBe(5); expect(getOtherIdx(3)).toBe(2); })
  })


  describe('updateFilter', () => {

    it('filters out un-needed fields', () => {
      const result = updateFilter({
        id: 'a', players: 'b', wins: 'c',
        title: 'd', roundcount: -12, canadvance: false,
      })
      expect(result).toMatchObject({ id: 'a', players: 'b', wins: 'c', })
      expect(result).not.toHaveProperty('title')
      expect(result).not.toHaveProperty('roundcount')
      expect(result).not.toHaveProperty('canadvance')
    })

    it('filters out saveDrops', () => {
      expect(updateFilter({drops: 'd', saveDrops: false}))
        .not.toHaveProperty('saveDrops')
    })
    it('retains drops if saveDrops', () => {
      expect(updateFilter({drops: 'd', saveDrops: true}))
        .toHaveProperty('drops', 'd')
    })
    it('filters out drops if !saveDrops', () => {
      expect(updateFilter({drops: 'd', saveDrops: false}))
        .not.toHaveProperty('drops')
    })
  })


  describe('swapArrays', () => {
    let baseArr, dataArr

    const getIdxSpy = jest.spyOn(swapUtils, 'getOtherIdx')
    afterAll(() => { getIdxSpy.mockRestore() })

    beforeEach(() => {
      getIdxSpy.mockImplementationOnce(() => 1)
      baseArr = [{ key: ['a','b','c','d'] },{ key: ['e','f','g','h'] }]
      dataArr = [{ baseIdx: 0, swapIdx: 1 }, { baseIdx: 1, swapIdx: 3 }]
    })

    it('swaps values between 2 different arrays', () => {
      swapArrays(dataArr, baseArr, 'key', 'baseIdx', 'swapIdx')
      expect(baseArr).toEqual([{ key: ['a','h','c','d'] },{ key: ['e','f','g','b'] }])
    })

    it('swaps values within same array', () => {
      dataArr[1].baseIdx = 0
      swapArrays(dataArr, baseArr, 'key', 'baseIdx', 'swapIdx')
      expect(baseArr[0]).toEqual({ key: ['a','d','c','b'] })
    })
  })


  describe('moveArrays', () => {
    let baseArr

    beforeEach(() => {
      baseArr = [{ key: ['a','b','c','d'] },{ key: ['e','f','g','h'] }]
    })

    it('moves item from one array to another', () => {
      moveArrays(baseArr, 0, 1, 'key', 2)
      expect(baseArr).toEqual([{ key: ['a','b','d'] },{ key: ['e','f','g','h','c'] }])
    })
    it('moves item within same array to end', () => {
      moveArrays(baseArr, 0, 0, 'key', 1)
      expect(baseArr[0]).toEqual({ key: ['a','c','d','b'] })
    })
  })
})