// Import
const { query } = require('../db/admin/directOps');
const main = require('./dbInterface.utils');
const {
  strTest, lineCount,
  queryLabels, queryValues,
  getFirst, getReturn, getSolo
} = main;


// ---- Test String ---- //

describe('strTest', () => {
  it('throws injected strings', () => {
    expect.assertions(2);
    expect(() => strTest('injection attempt'))
      .toThrowError("Possible SQL injection: injection attempt");
    expect(() => strTest('injection;'))
      .toThrowError("Possible SQL injection: injection;");
  });

  it('passes non-injected strings', () => {
    expect(strTest('safe')).toBe('safe');
  });

  it('converts non-strings', () => {
    expect(strTest(22)).toBe('22');
  });

  it('accepts arrays, throws on injected', () => {
    expect.assertions(1);
    expect(() => strTest(['safe','injection;']))
      .toThrowError("Possible SQL injection: injection;");
  });

  it('accepts arrays, passes non-injected', () => {
    expect(strTest(['safe',22,'pass']))
      .toEqual(['safe','22','pass']);
  });
});


// ---- Get SQL Query Line Count ---- //

describe('lineCount', () => {
  it('counts multi semicolons', () => {
    expect(lineCount('qry1; qry2;')).toBe(2);
  });

  it('counts line end w/o semi-colon', () => {
    expect(lineCount('qry1; qry2')).toBe(2);
  });

  it('skips line end if no text after semi-colon', () => {
    expect(lineCount('qry1; qry2;  \n  ')).toBe(2);
  });
  
  it('falsy qry returns 0', () => {
    expect(lineCount(undefined)).toBe(0);
    expect(lineCount('')).toBe(0);
    expect(lineCount(' ')).toBe(0);
  });
});


// ---- Get Query Labels ---- //

describe('queryLabels', () => {
  it('from key array', () => {
    expect(queryLabels([0,1,2], [1,2,3])).toEqual([
      '($1, $2, $3)','($4, $5, $6)','($7, $8, $9)'
    ]);
  });

  it('from key count', () => {
    expect(queryLabels([0,1,2], 3)).toEqual([
      '($1, $2, $3)','($4, $5, $6)','($7, $8, $9)'
    ]);
  });

  it('skips undefined keys', () => {
    expect(queryLabels([0,1,2], [1,undefined,2])).toEqual([
      '($1, $2)','($3, $4)','($5, $6)',
    ]);
  });

  it('from no keys', () => {
    expect(queryLabels([0,1,2], [])).toBe('');
    expect(queryLabels([0,1,2], 0)).toBe('');
  });

  it('from empty objArray', () => {
    expect(queryLabels([], [1,2,3])).toEqual([]);
  });
});


// ---- Get Query Values ---- //

describe('queryValues', () => {
  const testArray = [
    { valA: 1, valB: 2 },
    { valA: 3, valB: 4 },
    { valA: 5, valB: 6 },
  ];

  it('uses keys', () => {
    expect(queryValues(testArray,['valA'])).toEqual([1,3,5]);
  });

  it('flattens result', () => {
    expect(queryValues(testArray,['valA','valB']))
      .toEqual([1,2,3,4,5,6]);
  });

  it('skips undefined keys', () => {
    expect(queryValues(testArray,['valA',undefined])).toEqual([1,3,5]);
  });

  it('returns undefined on missing keys', () => {
    expect(queryValues(testArray,['valA','missing']))
      .toEqual([1,undefined,3,undefined,5,undefined]);
  });

  it('accepts empty keys', () => {
    expect(queryValues(testArray,[])).toEqual([]);
  });

  it('accepts empty array', () => {
    expect(queryValues([],['valA'])).toEqual([]);
  });
});


// ---- Get First Return Value ---- //

describe('getFirst', () => {
  it('returns 0th item in result', () => {
    expect(getFirst()([1,2,3])).toBe(1);
  });

  it('passes result if falsy 0th item', () => {
    expect(getFirst()([0,1,2])).toEqual([0,1,2]);
  });

  it('passes result if not array', () => {
    expect(getFirst()('result')).toEqual('result');
  });

  it('passes result if additBool = falsy', () => {
    expect(getFirst(null)([1,2,3])).toEqual([1,2,3]);
    expect(getFirst(false)([1,2,3])).toEqual([1,2,3]);
  });
});


// ---- Extract Return Value ---- //

describe('getReturn', () => {
  const sampleResult = [
    { other: 'ig1', rows: 'res1' },
    { other: 'ig2', rows: 'res2' },
    { other: 'ig3', rows: 'res3' },
  ];
  it('gets rows from result', () => {
    expect(getReturn(sampleResult[0])).toBe('res1');
  });
  it('gets rows from array', () => {
    expect(getReturn(sampleResult)).toEqual(['res1','res2','res3']);
  });
  it('passes result if no/falsy rows', () => {
    expect(getReturn('result')).toBe('result');
    expect(getReturn(['result'])).toEqual(['result']);
    expect(getReturn({other: 'result', rows: null}))
      .toEqual({other: 'result', rows: null});
    expect(getReturn([{other: 'result', rows: null}]))
      .toEqual([{other: 'result', rows: null}]);
  });
  it('passes result if no/falsy result', () => {
    expect(getReturn()).toBeUndefined();
    expect(getReturn(false)).toBe(false);
    expect(getReturn([false,null])).toEqual([false,null]);
  });
});


// ---- Get First If Solo Query ---- //

describe('getSolo', () => {
  const sampleResult = ['res1','res2'];
  const getFirstSpy  = jest.spyOn(main, 'getFirst');
  const lineCountSpy = jest.spyOn(main, 'lineCount');

  afterAll(() => { getFirstSpy.mockRestore(); lineCountSpy.mockRestore(); });

  it('pass result if no/multi-query array', () => {
    expect(getSolo([1,2])(sampleResult)).toBe(sampleResult);
    expect(getSolo([])(sampleResult)).toBe(sampleResult);
  });

  it('pass result if no/multi-query string', () => {
    lineCountSpy.mockReturnValueOnce(0).mockReturnValueOnce(2);
    expect(getSolo('')(sampleResult)).toBe(sampleResult);
    expect(getSolo('q1; q2')(sampleResult)).toBe(sampleResult);
  });

  it('use getFirst if solo-query', () => {
    getFirstSpy.mockImplementation(b => r => b && r);
    lineCountSpy.mockReturnValueOnce(1);

    expect(getSolo('q1;')(['solo'])).toEqual(['solo']);
    expect(getFirstSpy).toBeCalledWith(true);
    getFirstSpy.mockClear();

    expect(getSolo(['q1'])(['solo'])).toEqual(['solo']);
    expect(getFirstSpy).toBeCalledWith(true);
  });
});


