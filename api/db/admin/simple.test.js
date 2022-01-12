
// Imports/Mocks
const simple = require('./simple');
const utils = require('../../services/sqlUtils');

jest.mock('./base', () => ({
  query: jest.fn((...args) => Promise.resolve(args)),
}));
jest.mock('../../services/sqlUtils', () => ({
  queryVars: jest.fn((a,s) => `$${s||1}+${a.length}`),
  strTest: jest.fn()
}));

// Tests
describe('getRow', () => {
  it('all ids & cols', () => {
    expect(simple.getRow('test')).resolves.toEqual([
      'SELECT * FROM test;',
      []
    ]);
  });
  it('all cols only', () => {
    expect(simple.getRow('test', 'ID')).resolves.toEqual([
      'SELECT * FROM test WHERE id = $1;',
      ['ID']
    ]);
  });
  it('all ids only', () => {
    expect(simple.getRow('test', 0, 'cols')).resolves.toEqual([
      'SELECT cols FROM test;',
      []
    ]);
  });
  it('specific id & col', () => {
    expect(simple.getRow('test', 'ID', 'cols')).resolves.toEqual([
      'SELECT cols FROM test WHERE id = $1;',
      ['ID']
    ]);
  });
});

describe('rmvRow', () => {
  it('correct query', () => {
    expect(simple.rmvRow('test', 'ID')).resolves.toEqual([
      'DELETE FROM test WHERE id = $1 RETURNING id;',
      ['ID']
    ]);
  });
});

describe('addRow', () => {
  it('correct query', async () => {
    await expect(simple.addRow('test', {a: 1, b: 2, c: 3})).resolves.toEqual([
      'INSERT INTO test(a,b,c) VALUES($1+3) RETURNING id;',
      [1,2,3]
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(3);
  });
});

describe('updateRow', () => {
  it('correct query', async () => {
    await expect(simple.updateRow('test', 'ID', {a: 1, b: 2, c: 3}, 'ret')).resolves.toEqual({
      id: 'ID',
      0: 'UPDATE test SET (a,b,c) = ($2+3) WHERE id = $1 RETURNING ret;',
      1: ['ID', 1, 2, 3],
      a: 1, b: 2, c: 3,
    });
    expect(utils.strTest).toHaveBeenCalledTimes(3);
  });
});