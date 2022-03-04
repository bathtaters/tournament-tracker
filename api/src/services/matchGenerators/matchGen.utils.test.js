const warnSpy = jest.spyOn(global.console, "warn");
const {
  count, sum, avg, diff,
  deepEqual, deepSwap, removeDupes,
  getCombos, getGroups, randomGroup
} = require('./matchGen.utils');

// console.warn setup
afterAll(() => { warnSpy.mockRestore(); });


// ---- Basic Math ---- //
describe('mathOps', () => {

  // COUNT
  describe('count', () => {
    it('counts', () => {
      expect(count('a', ['a','b','c','a','b','a'])).toBe(3)
      expect(count('c', ['a','b','c','a','b','a'])).toBe(1)
    })
    it('works with empty array', () => {
      expect(count('a', [])).toBe(0)
      expect(count('c', [])).toBe(0)
    })
    it('works with missing item', () => {
      expect(count('d', ['a','b','c','a','b','a'])).toBe(0)
      expect(count('',  ['a','b','c','a','b','a'])).toBe(0)
    })
  })

  // SUM
  describe('sum', () => {
    it('sums', () => {
      expect(sum([1, 3, 6, 2, 4])).toBe(16)
      expect(sum([10, 20, 20, 5])).toBe(55)
    })
    it('works with single element', () => {
      expect(sum([13])).toBe(13)
    })
    it('works with empty array', () => {
      expect(sum([])).toBe(0)
    })
  })

  // AVERAGE
  describe('avg', () => {
    it('averages', () => {
      expect(avg([3, 6, 2, 5, 4])).toBeCloseTo(4)
      expect(avg([10, 23, 17, 5])).toBeCloseTo(13.75)
    })
    it('works with single element', () => {
      expect(avg([13])).toBe(13)
    })
    it('works with empty array', () => {
      expect(avg([])).toBe(0)
    })
  })

  // DIFFERENCE
  describe('diff', () => {
    it('standard difference', () => {
      expect(diff( 4,  2)).toBe( 2)
      expect(diff( 9,  1)).toBe( 8)
      expect(diff(35, 24)).toBe(11)
    })
    it('absolute difference', () => {
      expect(diff( 2,  4)).toBe( 2)
      expect(diff( 1,  9)).toBe( 8)
      expect(diff(12, 31)).toBe(19)
    })
    it('works when difference is 0', () => {
      expect(diff( 0,  0)).toBe(0)
      expect(diff( 4,  4)).toBe(0)
      expect(diff(13, 13)).toBe(0)
    })
  })
})


// ---- Array Operations ---- //
describe('arrayOps', () => {

  // DEEP EQUAL
  describe('deepEqual', () => {
    it('works with non-array', () => {
      expect(deepEqual('test','test' )).toBe(true)
      expect(deepEqual('test','test+')).toBe(false)
    })
    it('works with 1D array', () => {
      expect(deepEqual(['a','b','c','d'],['a','b','c','d'])).toBe(true)
      expect(deepEqual(['a','b','c','d'],['a','b','e','d'])).toBe(false)
      expect(deepEqual(['a','b','c','d'],['a','d','c','b'])).toBe(false)
      expect(deepEqual(['a','b','c'],['a','b','c','d'])).toBe(false)
    })
    it('works with 2D array', () => {
      expect(deepEqual([[1,2,3],[4,5,6]],[[1,2,3],[4,5,6]])).toBe(true)
      expect(deepEqual([[1,2,3],[4,5,6]],[[1,2,3],[4,6,5]])).toBe(false)
      expect(deepEqual([[1,2],[4,5,6]],[[1,3],[4,5,6]])).toBe(false)
    })
    it('works with multi-D array', () => {
      expect(deepEqual(['a',[1,2],[[3],[['b']]]],['a',[1,2],[[3],[['b' ]]]])).toBe(true)
      expect(deepEqual(['a',[1,2],[[3],[['b']]]],['a',[1,2],[[4],[['b' ]]]])).toBe(false)
      expect(deepEqual(['a',[1,2],[[3],[['b']]]],['a',[1,2],[[3],[['ba']]]])).toBe(false)
      expect(deepEqual(['a',[1,2],[[3],[['b']]]],['a',[1,2],[[3], ['b' ]]] )).toBe(false)
      expect(deepEqual(['a',[1,2],[[3],[['b']]]], null)).toBe(false)
    })
  })

  // DEEP SWAP
  describe('deepSwap', () => {
    it('works with non-array', () => {
      expect(deepSwap('test', {test: 'swap'})).toBe('swap')
      expect(deepSwap('test-2', {test: 'swap'})).toBe('test-2')
    })
    it('works with 1D array', () => {
      expect(deepSwap(['a','b','c','d'], {b:'test', c:'swap'}))
        .toEqual(['a','test','swap','d'])
    })
    it('works with 2D array', () => {
      expect(deepSwap([['a','b'],['c','d']], {b:'swap', d:'test'}))
        .toEqual([['a','swap'], ['c','test']])
    })
    it('works with multi-D array', () => {
      expect(deepSwap(['a',[1,2],[[3],[['b']]]], {b:'test', '2':'swap'}))
        .toEqual(['a',[1,'swap'],[[3],[['test']]]])
    })
    it('empty dict does nothing', () => {
      expect(deepSwap(['a','b',['c','d']], {})).toEqual(['a','b',['c','d']])
    })
    it('returns copy of array', () => {
      let array = ['a','b',['c','d']]
      expect(deepSwap(array, {})).not.toBe(array)
      expect(array).toEqual(['a','b',['c','d']])
    })
  })

  // REMOVE DUPES
  describe('removeDupes', () => {
    it('removes a dupe', () => {
      expect(removeDupes(['a','b','b','c'])).toEqual(['a','b','c'])
    })
    it('removes +1 dupes', () => {
      expect(removeDupes(['a','b','c','c','c','c'])).toEqual(['a','b','c'])
    })
    it('removes multiple dupes', () => {
      expect(removeDupes(['a','a','b','c','c'])).toEqual(['a','b','c'])
    })
    it('removes +1 of multiple dupes', () => {
      expect(removeDupes(['a','a','a','a','b','b','c'])).toEqual(['a','b','c'])
    })
    it('detects deep equality', () => {
      expect(removeDupes([['a','b'],['b','c'],['b','c'],['c','d']]))
        .toEqual([['a','b'],['b','c'],['c','d']])
      expect(removeDupes([1,[2,3],[2,3],[2,3],[4,5,6]]))
        .toEqual([1,[2,3],[4,5,6]])
    })
  })
})


// ---- Combination Operations ---- //
describe('combinationOps', () => {

  // GET COMBOS
  describe('getCombos', () => {
    it('gets combinations of size 1', () => {
      expect(getCombos(['a','b'],         1)).toEqual([['a'],['b']])
      expect(getCombos(['a','b','c'],     1)).toEqual([['a'],['b'],['c']])
      expect(getCombos(['a','b','c','d'], 1)).toEqual([['a'],['b'],['c'],['d']])
    })
    it('gets combinations of size 2', () => {
      expect(getCombos(['a','b','c'], 2)).toEqual([['a','b'], ['a','c'], ['b','c']])
      expect(getCombos(['a','b','c','d'], 2)).toEqual([
        ['a','b'], ['a','c'], ['a','d'],
        ['b','c'], ['b','d'], ['c','d'],
      ])
    })
    it('gets combinations of size 3', () => {
      expect(getCombos(['a','b','c','d'], 3)).toEqual([
        ['a','b','c'], ['a','b','d'],
        ['a','c','d'], ['b','c','d'],
      ])
      expect(getCombos(['a','b','c','d','e'], 3)).toEqual([
        ['a','b','c'], ['a','b','d'], ['a','b','e'],
        ['a','c','d'], ['a','c','e'], ['a','d','e'],
        ['b','c','d'], ['b','c','e'], ['b','d','e'], ['c','d','e'],
      ])
    })
    it('gets single combination', () => {
      expect(getCombos(['a','b'],             2)).toEqual([['a','b']])
      expect(getCombos(['a','b','c'],         3)).toEqual([['a','b','c']])
      expect(getCombos(['a','b','c','d'],     4)).toEqual([['a','b','c','d']])
      expect(getCombos(['a','b','c','d','e'], 5)).toEqual([['a','b','c','d','e']])
    })
    it('minimum width = 1', () => {
      expect(getCombos(['a','b','c'],   0)).toEqual([['a'],['b'],['c']])
      expect(getCombos(['a','b','c'],  -1)).toEqual([['a'],['b'],['c']])
      expect(getCombos(['a','b','c'], -13)).toEqual([['a'],['b'],['c']])
    })
    it('single-element input array', () => {
      expect(getCombos(['a'], 1)).toEqual([['a']])
    })
    it('warn when input array smaller than width', () => {
      warnSpy.mockImplementationOnce(()=>{}).mockImplementationOnce(()=>{})

      expect(getCombos([],            -1)).toEqual([])
      expect(getCombos(['a','b','c'], 12)).toEqual([])
      expect(warnSpy).toBeCalledTimes(2)
      
      expect(warnSpy).toHaveBeenNthCalledWith(1,
        'getCombos array is smaller than width', -1, 0, expect.any(Array)
      )
      expect(warnSpy).toHaveBeenNthCalledWith(2,
        'getCombos array is smaller than width', 12, 3, expect.any(Array)
      )
    })
  })

  // GET GROUPS
  describe('getGroups', () => {
    it('gets groups of size 1', () => {
      expect(getGroups(['a','b'], 1)).toEqual([[['a'],['b']]])
      expect(getGroups(['a','b','c','d'], 1)).toEqual([[['a'],['b'],['c'],['d']]])
    })
    it('gets groups of size 2', () => {
      expect(getGroups(['a','b','c','d'], 2)).toEqual([
        [['a','b'],['c','d']], [['a','c'],['b','d']], [['a','d'],['b','c']]
      ])
    })
    it('gets groups of size 3', () => {
      expect(getGroups(['a','b','c','d','e','f'], 3)).toEqual([
        [['a','b','c'], ['d','e','f']], [['a','b','d'], ['c','e','f']],
        [['a','b','e'], ['c','d','f']], [['a','b','f'], ['c','d','e']],
        [['a','c','d'], ['b','e','f']], [['a','c','e'], ['b','d','f']],
        [['a','c','f'], ['b','d','e']], [['a','d','e'], ['b','c','f']],
        [['a','d','f'], ['b','c','e']], [['a','e','f'], ['b','c','d']],
      ])
    })
    it('get uneven group sizes', () => {
      expect(getGroups(['a','b','c'], 2)).toEqual([
        [['a','b'],['c']], [['a'],['b','c']], [['a','c'],['b']],
      ])
      expect(getGroups(['a','b','c','d'], 3)).toEqual([
        [['a','b','c'],['d']], [['a'],['b','c','d']], 
        [['a','b','d'],['c']], [['a','c','d'],['b']], 
      ])
    })
    it('get single group', () => {
      expect(getGroups(['a','b'],         2)).toEqual([[['a','b']]])
      expect(getGroups(['a','b','c'],     3)).toEqual([[['a','b','c']]])
      expect(getGroups(['a','b','c','d'], 4)).toEqual([[['a','b','c','d']]])
    })
    it('minimum width = 1', () => {
      expect(getGroups(['a','b','c','d'],   0)).toEqual([[['a'],['b'],['c'],['d']]])
      expect(getGroups(['a','b','c','d'],  -1)).toEqual([[['a'],['b'],['c'],['d']]])
      expect(getGroups(['a','b','c','d'], -13)).toEqual([[['a'],['b'],['c'],['d']]])
    })
    it('using input smaller than width', () => {
      expect(getGroups(['a','b'],          3)).toEqual([[['a','b']]])
      expect(getGroups(['a','b','c','d'],  8)).toEqual([[['a','b','c','d']]])
      expect(getGroups(['a'], 12)).toEqual([[['a']]])
    })
    it('using input of 1 element', () => {
      expect(getGroups(['a'],  1)).toEqual([[['a']]])
      expect(getGroups(['a'],  3)).toEqual([[['a']]])
      expect(getGroups(['a'], 12)).toEqual([[['a']]])
    })
    it('using empty input', () => {
      expect(getGroups([],  1)).toEqual([[]])
      expect(getGroups([],  3)).toEqual([[]])
      expect(getGroups([], 12)).toEqual([[]])
    })
  })
})

// ---- Randomize & 2D-ize Array ---- //
describe('randomGroup', () => {
  const input  = ['a','b','c','d']
  const output = expect.stringMatching(RegExp('^['+input.join('')+']$'))

  it('elemSize of 2', () => {
    expect(randomGroup(input, 2)).toEqual([[output,output],[output,output]]);
  });
  it('elemSize of 1', () => {
    expect(randomGroup(input, 1)).toEqual([[output],[output],[output],[output]]);
  });
  it('elemSize of 0 copies array', () => {
    expect(randomGroup(input, 0)).toEqual(input.map(()=>output));
  });
  it('elemSize is array length', () => {
    expect(randomGroup(input, 4)).toEqual([input.map(()=>output)]);
  });
  it('elemSize not factor of array length', () => {
    expect(randomGroup(input, 3)).toEqual([[output,output,output],[output]]);
  });
  it('empty array passes through', () => {
    expect(randomGroup([], 1)).toEqual([]);
    expect(randomGroup([], 3)).toEqual([]);
    expect(randomGroup([], 0)).toEqual([]);
  });
  it('doesn\'t mutate array', () => {
    let array = input.slice();
    const result = randomGroup(array, 1);
    expect(result).not.toBe(array);
    expect(array).toEqual(input);
  });
});