const warnSpy = jest.spyOn(global.console, "warn");
const {
  count, sum, avg, diff,
  remaining, getGroups, getGroupsSimple, randomGroup
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

  // REMAINING
  describe('remaining', () => {
    it('works with empty arrays', () => {
      expect(remaining([],[[1,2,3],[4,5,6]])).toEqual([])
      expect(remaining([1,2,3,4,5,6],[])).toEqual([1,2,3,4,5,6])
    })
    it('works with 2D array', () => {
      expect(remaining([1,2,3,4,5,6],[[1,2,3],[4,5,6]])).toEqual([])
      expect(remaining([1,2,3,4,5,6],[[1,2,3],[4,5]])).toEqual([6])
      expect(remaining([1,2,4,5,6],[[1,3],[7,5,6]])).toEqual([2,4])
    })
    it('allows null parameter 2', () => {
      expect(remaining(['a',1,2,3,'b'], null)).toEqual(['a',1,2,3,'b'])
    })
  })
})


// ---- Combination Operations ---- //
describe('combinationOps', () => {

  // GET GROUPS
  describe('getGroups', () => {
    it('gets groups of size 1', () => {
      expect([...getGroups(['a','b'], 1)]).toEqual([[['a'],['b']]])
      expect([...getGroups(['a','b','c','d'], 1)]).toEqual([[['a'],['b'],['c'],['d']]])
    })
    it('gets groups of size 2', () => {
      expect([...getGroups(['a','b','c','d'], 2)]).toEqual([
        [['a','b'],['c','d']], [['a','c'],['b','d']], [['a','d'],['b','c']]
      ])
    })
    it('gets groups of size 3', () => {
      expect([...getGroups(['a','b','c','d','e','f'], 3)]).toEqual([
        [['a','b','c'], ['d','e','f']], [['a','b','d'], ['c','e','f']],
        [['a','b','e'], ['c','d','f']], [['a','b','f'], ['c','d','e']],
        [['a','c','d'], ['b','e','f']], [['a','c','e'], ['b','d','f']],
        [['a','c','f'], ['b','d','e']], [['a','d','e'], ['b','c','f']],
        [['a','d','f'], ['b','c','e']], [['a','e','f'], ['b','c','d']],
      ])
    })
    it('get uneven group sizes', () => {
      expect([...getGroups(['a','b','c'], 2)]).toEqual([
        [['a','b'],['c']], [['a','c'],['b']], [['b','c'],['a']],
      ])
      expect([...getGroups(['a','b','c','d'], 3)]).toEqual([
        [['a','b','c'],['d']], [['a','b','d'],['c']], 
        [['a','c','d'],['b']], [['b','c','d'],['a']],
      ])
    })
    it('get single group', () => {
      expect([...getGroups(['a','b'],         2)]).toEqual([[['a','b']]])
      expect([...getGroups(['a','b','c'],     3)]).toEqual([[['a','b','c']]])
      expect([...getGroups(['a','b','c','d'], 4)]).toEqual([[['a','b','c','d']]])
    })
    it('minimum width = 1', () => {
      expect([...getGroups(['a','b','c','d'],   0)]).toEqual([[['a'],['b'],['c'],['d']]])
      expect([...getGroups(['a','b','c','d'],  -1)]).toEqual([[['a'],['b'],['c'],['d']]])
      expect([...getGroups(['a','b','c','d'], -13)]).toEqual([[['a'],['b'],['c'],['d']]])
    })
    it('using input smaller than width', () => {
      expect([...getGroups(['a','b'],          3)]).toEqual([[['a','b']]])
      expect([...getGroups(['a','b','c','d'],  8)]).toEqual([[['a','b','c','d']]])
      expect([...getGroups(['a'], 12)]).toEqual([[['a']]])
    })
    it('using input of 1 element', () => {
      expect([...getGroups(['a'],  1)]).toEqual([[['a']]])
      expect([...getGroups(['a'],  3)]).toEqual([[['a']]])
      expect([...getGroups(['a'], 12)]).toEqual([[['a']]])
    })
    it('using empty input', () => {
      expect([...getGroups([],  1)]).toEqual([])
      expect([...getGroups([],  3)]).toEqual([])
      expect([...getGroups([], 12)]).toEqual([])
    })
    it('stress test (Input array of size 11, <1 sec)', () => {
      const values = ['a','b','c','d','e','f','g','h','i','j','k']
      expect([...getGroups(values,  2)]).toHaveLength(10395)
      expect([...getGroups(values,  3)]).toHaveLength(15400)
    }, 1000)
  })
})

// GET GROUPS (Simple Algorithm)
describe('getGroupsSimple', () => {
  it('gets groups of size 1', () => {
    expect(getGroupsSimple(['a','b'], 1)).toEqual([['a'],['b']])
    expect(getGroupsSimple(['a','b','c','d'], 1)).toEqual([['a'],['b'],['c'],['d']])
  })
  it('gets groups of size 2', () => {
    expect(getGroupsSimple(['a','b','c','d'], 2)).toEqual([['a','b'],['c','d']])
  })
  it('gets groups of size 3', () => {
    expect(getGroupsSimple(['a','b','c','d','e','f'], 3)).toEqual([['a','b','c'], ['d','e','f']])
  })
  it('get uneven group sizes', () => {
    expect(getGroupsSimple(['a','b','c'], 2)).toEqual([['a','b'],['c']])
    expect(getGroupsSimple(['a','b','c','d'], 3)).toEqual([['a','b','c'],['d']])
  })
  it('get single group', () => {
    expect(getGroupsSimple(['a','b'],         2)).toEqual([['a','b']])
    expect(getGroupsSimple(['a','b','c'],     3)).toEqual([['a','b','c']])
    expect(getGroupsSimple(['a','b','c','d'], 4)).toEqual([['a','b','c','d']])
  })
  it('minimum width = 1', () => {
    expect(getGroupsSimple(['a','b','c','d'],   0)).toEqual([['a'],['b'],['c'],['d']])
    expect(getGroupsSimple(['a','b','c','d'],  -1)).toEqual([['a'],['b'],['c'],['d']])
    expect(getGroupsSimple(['a','b','c','d'], -13)).toEqual([['a'],['b'],['c'],['d']])
  })
  it('using input smaller than width', () => {
    expect(getGroupsSimple(['a','b'],          3)).toEqual([['a','b']])
    expect(getGroupsSimple(['a','b','c','d'],  8)).toEqual([['a','b','c','d']])
    expect(getGroupsSimple(['a'], 12)).toEqual([['a']])
  })
  it('using input of 1 element', () => {
    expect(getGroupsSimple(['a'],  1)).toEqual([['a']])
    expect(getGroupsSimple(['a'],  3)).toEqual([['a']])
    expect(getGroupsSimple(['a'], 12)).toEqual([['a']])
  })
  it('using empty input', () => {
    expect(getGroupsSimple([],  1)).toEqual([])
    expect(getGroupsSimple([],  3)).toEqual([])
    expect(getGroupsSimple([], 12)).toEqual([])
  })
  it('stress test (Input array of size 20, <1 sec)', () => {
    const values = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t']
    expect(getGroupsSimple(values,  2).flatMap((x) => x)).toEqual(values)
    expect(getGroupsSimple(values,  3).flatMap((x) => x)).toEqual(values)
  }, 1000)
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