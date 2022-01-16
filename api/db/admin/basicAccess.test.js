
// Imports/Mocks
const mockWarn = jest.spyOn(global.console, "warn");
const simple = require('./basicAccess');
const utils = require('../../services/sqlUtils');
const advancedAccess = require('./advancedAccess');

jest.mock('./advancedAccess', () => ({
  query: jest.fn((...args) => Promise.resolve(args)),
}));
jest.mock('../../services/sqlUtils');

// Setup Tests
const client = {
  query: jest.fn((...args) => Promise.resolve(['testClient',...args])),
};

beforeAll(() => {
  utils.queryVars.mockImplementation((a,s) => `$${s||1}+${a.length}`);
  utils.getSolo.mockImplementation(() => r => r);
  utils.getFirst.mockImplementation(() => r => r);
  utils.getReturn.mockImplementation(r => r);
});

afterAll(() => { mockWarn.mockRestore(); });


// Tests
describe('getRows', () => {
  it('table param only', () => 
    expect(simple.getRows('test')).resolves.toEqual([
      'SELECT * FROM test ;',
      []
    ])
  );
  it('filter param', () => 
    expect(simple.getRows('test', 'FILTER')).resolves.toEqual([
      'SELECT * FROM test FILTER;',
      []
    ])
  );
  it('args param', () => 
    expect(simple.getRows('test', 0, ['args'])).resolves.toEqual([
      'SELECT * FROM test ;',
      ['args']
    ])
  );
  it('cols param', () => 
    expect(simple.getRows('test',0,0,'cols')).resolves.toEqual([
      'SELECT cols FROM test ;',
      []
    ])
  );
  it('all params', () => 
    expect(simple.getRows('test','FILTER',['args'],'cols')).resolves.toEqual([
      'SELECT cols FROM test FILTER;',
      ['args']
    ])
  );
  it('cols as string', () => 
    expect(simple.getRows('test',0,0,'colA, colB')).resolves.toEqual([
      'SELECT colA, colB FROM test ;',
      []
    ])
  );
  it('cols as array', () => 
    expect(simple.getRows('test',0,0,['colA','colB'])).resolves.toEqual([
      'SELECT colA, colB FROM test ;',
      []
    ])
  );

  it('uses sqlHelpers', async () => {
    await simple.getRows('test');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
  });

  it('uses custom client', async () => {
    await simple.getRows('test',0,'args',0,client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM test ;', 'args'
    );
  });
});


describe('getRow', () => {
  const getRowsSpy = jest.spyOn(simple, 'getRows');

  it('uses getRows', async () => {
    await simple.getRow('test');
    expect(getRowsSpy).toBeCalledTimes(1);
    expect(getRowsSpy).toBeCalledWith(
      'test',
      '',
      null,
      null,
      expect.any(Object)
    );
  });
  it('id param', async () => {
    await simple.getRow('test', 'ID');
    expect(getRowsSpy).toBeCalledWith(
      'test',
      'WHERE id = $1',
      ['ID'],
      null,
      expect.any(Object)
    );
  });
  it('col param', async () => {
    await simple.getRow('test', 'ID', 'cols');
    expect(getRowsSpy).toBeCalledWith(
      'test',
      'WHERE id = $1',
      ['ID'],
      'cols',
      expect.any(Object)
    );
  });

  it('uses sqlHelpers', async () => {
    await simple.getRow('test','ID');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith('ID');
  });
  
  it('uses custom client', async () => {
    await simple.getRow('test', 0, 0, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM test ;', []
    );
  });
});


describe('rmvRow', () => {
  it('correct query', () => 
    expect(simple.rmvRow('test', 'ID')).resolves.toEqual([
      'DELETE FROM test WHERE id = $1 RETURNING id;',
      ['ID']
    ])
  );

  it('uses sqlHelpers', async () => {
    await simple.rmvRow('test','ID');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
  });
  
  it('uses custom client', async () => {
    await simple.rmvRow('test', 'ID', client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM test WHERE id = $1 RETURNING id;',
      ['ID']
    );
  });
});


describe('addRow', () => {
  it('correct query', async () => {
    await expect(simple.addRow('test', {a: 1, b: 2, c: 3})).resolves.toEqual([
      'INSERT INTO test (a,b,c) VALUES ($1+3) RETURNING id;',
      [1,2,3]
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(['a','b','c']);
  });

  it('warns on empty colObj', async () => {
    mockWarn.mockImplementationOnce(()=>{});
    await simple.addRow('test',{});
    expect(mockWarn).toHaveBeenCalledWith('Added empty row to test');
  });

  it('adds empty row', () => {
    mockWarn.mockImplementationOnce(()=>{});
    return expect(simple.addRow('test',{})).resolves.toEqual([
      'INSERT INTO test DEFAULT VALUES RETURNING id;',
      []
    ])
  });

  it('uses sqlHelpers', async () => {
    await simple.addRow('test', {a: 1});
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
  });
  
  it('uses custom client', async () => {
    await simple.addRow('test', {a: 1}, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'INSERT INTO test (a) VALUES ($1+1) RETURNING id;',
      [1]
    );
  });
});

describe('updateRow', () => {
  it('correct query', async () => {
    await expect(simple.updateRow(
      'test',
      'ID',
      {a: 1, b: 2, c: 3},
      'x'
    )).resolves.toEqual({
      id: 'ID',
      0: 'UPDATE test SET a = $2, b = $3, c = $4 WHERE id = $1 RETURNING x;',
      1: ['ID', 1, 2, 3],
      a: 1, b: 2, c: 3,
    });
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(['a','b','c']);
  });

  it('throws on empty updateObj', () => {
    expect.assertions(1);
    return expect(() => simple.updateRow('test','ID',{}))
      .toThrowError('No properties provided to update test[ID]');
  });

  it('sends error on empty return', () => {
    advancedAccess.query.mockResolvedValueOnce(null);
    return expect(simple.updateRow('test','ID',{a: 1})).resolves
      .toHaveProperty('error','Missing return value.');
  });
  
  it('uses sqlHelpers', async () => {
    await simple.updateRow('test','ID',{a: 1});
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
  });

  it('uses custom client', async () => {
    await simple.updateRow('test', 'ID', {a: 1}, 'x', client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'UPDATE test SET a = $2 WHERE id = $1 RETURNING x;',
      ['ID', 1]
    );
  });
});