const { asType, toObjArray } = require('./settings.services');

describe('asType', () => {
  it('string', () => {
    expect(asType({ value: 'test', type: 'string' })).toBe('test');
  });
  it('boolean', () => {
    expect(asType({ value: 'false', type: 'boolean' })).toBe(false);
  });
  it('date', () => {
    expect(asType({ value: '01/01/22', type: 'date' })).toEqual(new Date('01/01/22'));
  });
  it('number', () => {
    expect(asType({ value: '12', type: 'bigint' })).toBe(12);
    expect(asType({ value: '12', type: 'number' })).toBe(12);
  });
  it('object', () => {
    expect(asType({ value: '{"a": 1}', type: 'object' })).toEqual({ a: 1 });
  });
  it('null/undef', () => {
    expect(asType({ value: null, type: 'object' })).toBeNull();
    expect(asType({ value: undefined, type: 'undefined' })).toBeUndefined();
  });
});

describe('toObjArray', () => {
  it('string', () => {
    expect(toObjArray({ test: 'testStr' }))
      .toEqual([{ id: 'test', value: 'testStr', type: 'string' }]);
  });
  it('boolean', () => {
    expect(toObjArray({ test: false }))
      .toEqual([{ id: 'test', value: 'false', type: 'boolean' }]);
  });
  it('date', () => {
    expect(toObjArray({ test: new Date('01/01/22') }))
      .toEqual([{ id: 'test', value: '2022-01-01T05:00:00.000Z', type: 'date' }]);
  });
  it('number', () => {
    expect(toObjArray({ test: 12 }))
      .toEqual([{ id: 'test', value: '12', type: 'number' }]);
  });
  it('object', () => {
    expect(toObjArray({ test: { a: 1 } }))
      .toEqual([{ id: 'test', value: '{"a":1}', type: 'object' }]);
  });
  it('null/undef', () => {
    expect(toObjArray({ test: null }))
      .toEqual([{ id: 'test', value: null, type: 'object' }]);
    expect(toObjArray({ test: undefined }))
      .toEqual([{ id: 'test', value: undefined, type: 'undefined' }]);
  });
});