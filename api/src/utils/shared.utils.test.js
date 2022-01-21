// Import/Mocks
const mockWarn = jest.spyOn(global.console, "warn");
const { arrToObj, insertSorted } = require('./shared.utils');

afterAll(() => { mockWarn.mockRestore(); });


// ---- Array to Object ---- //

describe('arrToObj', () => {
  let testArray;
  const expectedResult = {
    a: { key: 'a', value: 1 },
    b: { key: 'b', value: 2 },
    c: { key: 'c', value: 3 },
  };

  beforeEach(() => {
    testArray = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
    ];
  });

  it('converts array to object', () => {
    expect(arrToObj('key',{delKey:0})(testArray)).toEqual(expectedResult);
  });

  it('converts single object to objArray', () => {
    expect(arrToObj('key',{delKey:0})(testArray[0]))
      .toEqual({ a: expectedResult.a, });
  });

  it('non-object passesthrough w/ alert', () => {
    mockWarn.mockImplementationOnce(()=>{});

    expect(arrToObj('key')('test')).toBe('test');

    expect(mockWarn).toBeCalledTimes(1);
    expect(mockWarn).toBeCalledWith('Expected object:','string','test');
  });

  it('falsy value passesthrough w/o alert', () => {
    expect(arrToObj('key')(0)).toBe(0);

    expect(mockWarn).not.toBeCalled();
  });

  it('alerts on missing key', () => {
    mockWarn.mockImplementationOnce(()=>{});

    expect(arrToObj('key',{delKey:0})(testArray.concat({ value: 4 })))
      .toEqual(expectedResult);

    expect(mockWarn).toBeCalledTimes(1);
    expect(mockWarn).toBeCalledWith('Entry is missing key:','key',{value:4});
  });

  it('throws on duplicate key', () => {
    expect.assertions(1);

    expect(() => arrToObj('key',{delKey:0})(testArray.concat({ key: 'a' })))
      .toThrowError('Object has duplicate key: [key] = a');
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
});