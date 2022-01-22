const { splicing, anyElements, unflat, revReplace2dIndex } = require('./matchGen.utils');

// ---- Splice-In-Place ---- //

describe('splicing', () => {
  it('returns spliced array', () => {
    expect(splicing(['a','b','c','d'], 2, 1)).toEqual(['a','b','d']);
  });
  it('removes multiple entries', () => {
    expect(splicing(['a','b','c','d'], 1, 2)).toEqual(['a','d']);
  });
  it('doesn\'t mutate input array', () => {
    let array = ['a','b','c','d'];
    const result = splicing(array, 1, 2);
    expect(result).not.toBe(array);
    expect(array).toEqual(['a','b','c','d']);
  });

  it('index of 0 unshifts', () => {
    expect(splicing(['a','b','c','d'], 0, 1)).toEqual(['b','c','d']);
  });
  it('index > length copies only', () => {
    expect(splicing(['a','b','c','d'], 5, 1)).toEqual(['a','b','c','d']);
  });
  it('count of 0 copies only', () => {
    expect(splicing(['a','b','c','d'], 2, 0)).toEqual(['a','b','c','d']);
  }); // try multiple idx vals
});


// ---- Test Common Elements ---- //

describe('anyElements', () => {
  it('no common elements = false', () => {
    expect(anyElements(['a','b','c'],['d','e','f'])).toBe(false);
  });
  it('one common element = true', () => {
    expect(anyElements(['a','b','c'],['d','e','b'])).toBe(true);
  });
  it('all common elements = true', () => {
    expect(anyElements(['a','b','c'],['a','b','c'])).toBe(true);
  });
  it('empty array = false', () => {
    expect(anyElements([],['d','e','f'])).toBe(false);
    expect(anyElements(['a','b','c'],[])).toBe(false);
    expect(anyElements([],[])).toBe(false);
  });
});


// ---- 2D-ize Array ---- //

describe('unflat', () => {
  it('elemSize of 2', () => {
    expect(unflat(['a','b','c','d'], 2)).toEqual([['a','b'],['c','d']]);
  });
  it('elemSize of 1', () => {
    expect(unflat(['a','b','c'], 1)).toEqual([['a'],['b'],['c']]);
  });
  it('elemSize of 0 copies array', () => {
    expect(unflat(['a','b','c'], 0)).toEqual(['a','b','c']);
  });
  it('elemSize is array length', () => {
    expect(unflat(['a','b','c'], 3)).toEqual([['a','b','c']]);
  });
  it('elemSize not factor of array length', () => {
    expect(unflat(['a','b','c'], 2)).toEqual([['a','b'],['c']]);
  });
  it('empty array passes through', () => {
    expect(unflat([], 1)).toEqual([]);
    expect(unflat([], 3)).toEqual([]);
    expect(unflat([], 0)).toEqual([]);
  });
  it('doesn\'t mutate array', () => {
    let array = ['a','b','c'];
    const result = unflat(array, 1);
    expect(result).not.toBe(array);
    expect(array).toEqual(['a','b','c']);
  });
});


// ---- Get Replacement Index of 2D Array ---- //

describe('revReplace2dIndex', () => {
  const array = [['a','b'],['c','d'],['e','f']];
  const matches = match => val => match === val;

  it('matches starting from end', () => {
    expect(revReplace2dIndex(array, 2, matches('b')))
    .toEqual([0,1]);
  });

  it('matches starting from start', () => {
    expect(revReplace2dIndex(array, 0, matches('d')))
      .toEqual([1,1]);
  });

  it('loops around from middle to match', () => {
    expect(revReplace2dIndex(array, 1, matches('e')))
      .toEqual([2,0]);
  });

  it('returns undefined when no match', () => {
    expect(revReplace2dIndex(array, 2, matches('g')))
      .toBeUndefined();
  });

  it('doesn\'t match item w/ startIdx', () => {
    expect(revReplace2dIndex(array, 1, matches('c')))
      .toBeUndefined();
  });

  it('isReplace recieves correct args', () => {
    const matchMock = jest.fn(() => true);
    revReplace2dIndex(array, 2, matchMock);
    expect(matchMock).toBeCalledWith('d',['c','d'],1);
  });
});