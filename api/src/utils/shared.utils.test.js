// Import/Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const { arrToObj, insertSorted, filtering, toDateStr, datesAreEqual, dayCount } = require('./shared.utils');

afterAll(() => { warnSpy.mockRestore(); });


// ---- Array to Object ---- //

describe('arrToObj', () => {
  let testArray, expectedResult;

  beforeEach(() => {
    testArray = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
    ];
    expectedResult = {
      a: { key: 'a', value: 1 },
      b: { key: 'b', value: 2 },
      c: { key: 'c', value: 3 },
    };
  });

  it('converts array to object', () => {
    expect(arrToObj('key',{delKey:0})(testArray)).toEqual(expectedResult);
  });

  it('converts single object to objArray', () => {
    expect(arrToObj('key',{delKey:0})(testArray[0]))
      .toEqual({ a: expectedResult.a, });
  });

  it('non-object passesthrough w/ alert', () => {
    warnSpy.mockImplementationOnce(()=>{});

    expect(arrToObj('key')('test')).toBe('test');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Expected object:','string','test');
  });

  it('falsy value passesthrough w/o alert', () => {
    expect(arrToObj('key')(0)).toBe(0);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('alerts on missing key', () => {
    warnSpy.mockImplementationOnce(()=>{});

    expect(arrToObj('key',{delKey:0})(testArray.concat({ value: 4 })))
      .toEqual(expectedResult);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Entry is missing key:','key',{value:4});
  });

  it('throws on duplicate key', () => {
    expect.assertions(1);

    expect(() => arrToObj('key',{delKey:0})(testArray.concat({ key: 'a' })))
      .toThrow('Object has duplicate key: [key] = a');
  });

  it('uses valKey as value', () => {
    expect(arrToObj('key',{valKey:'value'})(testArray))
      .toEqual({ a: 1, b: 2, c: 3 });
  });

  it('deletes keys if delKey set', () => {
    expect(arrToObj('key',{delKey:true})(testArray)).toEqual({
      a: { value: 1 },
      b: { value: 2 },
      c: { value: 3 },
    });
  });

  it('combines duplicate keys if combo set', () => {
    // Convert results to arrays
    Object.keys(expectedResult).forEach(k => expectedResult[k] = [expectedResult[k]]);
    // Include duplicate key
    testArray.push({ key: 'a', test: 1 });
    expectedResult.a.push({ key: 'a', test: 1 });
    // Check
    expect(arrToObj('key',{delKey:0, combo:1})(testArray)).toEqual(expectedResult);
  });
});



// ---- Insert Sorted ---- //

describe('insertSorted', () => {
  const basicSort = (a,b) => a < b;
  let testArray;
  beforeEach(() => { testArray = [2, 4, 6, 8]; });

  it('inserts in middle', () => {
    expect(insertSorted(testArray, 5, basicSort)).toEqual([2, 4, 5, 6, 8]);
  });

  it('inserts at start', () => {
    expect(insertSorted(testArray, 1, basicSort)).toEqual([1, 2, 4, 6, 8]);
  });

  it('inserts at end', () => {
    expect(insertSorted(testArray, 9, basicSort)).toEqual([2, 4, 6, 8, 9]);
  });

  it('works with length = 0', () => {
    expect(insertSorted([], 5, basicSort)).toEqual([5]);
  });

  it('works with length = 1, before', () => {
    expect(insertSorted([5], 4, basicSort)).toEqual([4, 5]);
  });

  it('works with length = 1, after', () => {
    expect(insertSorted([5], 6, basicSort)).toEqual([5, 6]);
  });

  it('works in reverse', () => {
    expect(insertSorted(testArray.reverse(), 3, (a,b) => a > b))
      .toEqual([8, 6, 4, 3, 2]);
  });

  it('works with object array', () => {
    expect(insertSorted(
      [ { val: 2 }, { val: 4 }, { val: 6 }, { val: 8 }, ],
      { newVal: 7 },
      (a,b) => a.val < b.newVal
    )).toEqual([
      { val:2 }, { val:4 }, { val:6 }, { newVal:7 }, { val:8 },
    ])
  });

  it('mutates passed array', () => {
    const res = insertSorted(testArray, 5, (a,b) => a < b);
    expect(res).toBe(testArray);
  });

  it('uses default sort algo', () => {
    expect(insertSorted(testArray, 5)).toEqual([2, 4, 5, 6, 8]);
  });
});

describe('filtering', () => {
  let sample;
  beforeEach(() => sample = { a:1, b:2, c:3 })

  it('removes ignore keys', () => {
    expect(filtering(sample, ['a'])).toEqual({ b:2, c:3 })
    expect(filtering(sample, ['a', 'c'])).toEqual({ b:2 })
  })
  it('can ignore missing keys', () => {
    expect(filtering(sample, ['d','e','f'])).toEqual(sample)
  })
  it('can ignore nothing', () => {
    expect(filtering(sample, [])).toEqual(sample)
  })
  it('copies input', () => {
    expect(filtering(sample, [])).not.toBe(sample)
  })
})

describe('toDateStr', () => {
  it('passes non-objects', () => {
    expect(toDateStr(0)).toBe(0)
    expect(toDateStr(-154)).toBe(-154)
    expect(toDateStr(true)).toBe(true)
    expect(toDateStr(null)).toBeNull()
    expect(toDateStr('test')).toBe('test')
    expect(toDateStr('')).toBe('')
    expect(toDateStr(undefined)).toBeUndefined()
  })

  it('passes arrays/objects', () => {
    expect(toDateStr([ 1, '2', true ]))
      .toEqual([ 1, '2', true ])
    expect(toDateStr({ a: 1, test: '2', x: true }))
      .toEqual({ a: 1, test: '2', x: true })
    expect(toDateStr({ a: 1, test: [ 1, '2', true ], x: true }))
      .toEqual({ a: 1, test: [ 1, '2', true ], x: true })
    expect(toDateStr([ 1, { a: 1, test: '2', x: true }, true ]))
      .toEqual([ 1, { a: 1, test: '2', x: true }, true ])
  })

  it('copies arrays/objects', () => {
    const arr = [ 1, '2', true ]
    const obj = { a: 1, test: '2', x: true }
    expect(toDateStr(arr)).not.toBe(arr)
    expect(toDateStr(obj)).not.toBe(obj)
    expect(toDateStr(arr)).toEqual(arr)
    expect(toDateStr(obj)).toEqual(obj)
  })

  it('converts dates', () => {
    expect(toDateStr(new Date(2021, 3-1, 19))).toBe('2021-03-19')
    expect(toDateStr(new Date('2004-04-12'))).toBe('2004-04-12')
  })

  it('converts nested dates', () => {
    expect(toDateStr([ 1, '2', new Date(2021, 3-1, 19) ]))
      .toEqual([ 1, '2', '2021-03-19' ])
    expect(toDateStr({ a: new Date('2004-04-12'), test: '2', x: true }))
      .toEqual({ a: '2004-04-12', test: '2', x: true })
    expect(toDateStr({ a: 1, test: [ 1, new Date(2021, 3-1, 19), true ], x: new Date('2004-04-12') }))
      .toEqual({ a: 1, test: [ 1, '2021-03-19', true ], x: '2004-04-12' })
    expect(toDateStr([ new Date(2021, 3-1, 19), { a: new Date('2004-04-12'), test: '2', x: true }, true ]))
      .toEqual([ '2021-03-19', { a: '2004-04-12', test: '2', x: true }, true ])
  })
})

describe("dayCount", () => {
  it("Correct count of days (inclusive)", () => {
    expect(dayCount(new Date(2020, 0, 1), new Date(2020, 0, 2))).toBeCloseTo(2)
    expect(dayCount(new Date(2020, 0, 1), new Date(2020, 0, 10))).toBeCloseTo(10)
    expect(dayCount(new Date(2012, 5, 4), new Date(2020, 0, 10))).toBeCloseTo(2777, 1)
  })
  it("Count of days as decimal", () => {
    expect(dayCount(new Date(2020, 0, 1, 1, 20), new Date(2020, 0, 2, 23, 45))).toBeCloseTo(2.93)
    expect(dayCount(new Date(2020, 0, 1, 11, 40), new Date(2020, 3, 10, 17, 30))).toBeCloseTo(101.2, 1)
  })
  it("Same day is 1", () => {
    expect(dayCount(new Date(2020, 0, 1), new Date(2020, 0, 1))).toBeCloseTo(1)
    expect(dayCount(new Date(2012, 5, 4), new Date(2012, 5, 4))).toBeCloseTo(1)
  })
  it("Works with reversed day count", () => {
    expect(dayCount(new Date(2020, 0, 2), new Date(2020, 0, 1))).toBeCloseTo(2)
    expect(dayCount(new Date(2020, 0, 10), new Date(2020, 0, 1))).toBeCloseTo(10)
    expect(dayCount(new Date(2020, 0, 10), new Date(2012, 5, 4))).toBeCloseTo(2777, 1)
  })
  it("reversed day count + decimal", () => {
    expect(dayCount(new Date(2020, 0, 2, 23, 45), new Date(2020, 0, 1, 1, 20))).toBeCloseTo(2.93)
    expect(dayCount(new Date(2020, 3, 10, 17, 30), new Date(2020, 0, 1, 11, 40))).toBeCloseTo(101.2, 1)
  })
})

describe("datesAreEqual", () => {
  it("Dates are same", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(2020, 0, 1))).toBe(true)
    expect(datesAreEqual(new Date(2012, 5, 4), new Date(2012, 5, 4, 13, 4))).toBe(true)
  })
  it("Dates are different", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(2020, 0, 2))).toBe(false)
    expect(datesAreEqual(new Date(2012, 5, 4), new Date(2012, 5, 16))).toBe(false)
  })
  it("Months are different", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(2020, 1, 1))).toBe(false)
    expect(datesAreEqual(new Date(2012, 5, 4), new Date(2012, 9, 4))).toBe(false)
  })
  it("Years are different", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(2021, 0, 1))).toBe(false)
    expect(datesAreEqual(new Date(2012, 5, 4), new Date(1995, 5, 4))).toBe(false)
  })
  it("Full years are different", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(1920, 0, 1))).toBe(false)
    expect(datesAreEqual(new Date(2012, 5, 4), new Date(2112, 5, 4))).toBe(false)
  })
  it("Everything is different", () => {
    expect(datesAreEqual(new Date(2020, 0, 1), new Date(2012, 5, 4))).toBe(false)
    expect(datesAreEqual(new Date(2022, 8, 12), new Date(2012, 2, 1))).toBe(false)
  })
})