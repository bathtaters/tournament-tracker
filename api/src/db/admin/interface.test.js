// Imports/Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const ops = require('./interface');
const utils = require('../../utils/dbInterface.utils');
const direct = require('./directOps');

jest.mock('./directOps', () => ({
  query: jest.fn((...args) => Promise.resolve(args)),
}));
jest.mock('../../utils/dbInterface.utils');

const soloInner  = jest.fn(r => r);
const firstInner = jest.fn(r => r);

// Setup Tests
const client = {
  query: jest.fn((...args) => Promise.resolve(['testClient',...args])),
};

beforeAll(() => {
  utils.queryValues.mockImplementation((a) => a.flatMap(o => Object.values(o)));
  utils.queryLabels.mockImplementation((a,k) => Object.keys(k));
  utils.getSolo.mockImplementation(() => soloInner);
  utils.getFirst.mockImplementation(() => firstInner);
  utils.getReturn.mockImplementation(r => r);
});

afterAll(() => { warnSpy.mockRestore(); });


// Tests

// ----- SELECT ----- //

describe('getCount', () => {
  let origDirectMock;

  beforeAll(() => {
    origDirectMock = direct.query.getMockImplementation();
    direct.query.mockImplementation((...args) => Promise.resolve({ count: args }));
  });
  afterAll(() => {
    direct.query.mockImplementation(origDirectMock);
  });
  
  it('table param only', () => 
    expect(ops.getCount('test')).resolves.toEqual([
      'SELECT COUNT(*) AS count FROM test ;',
      []
    ])
  );
  it('filter param', () => 
    expect(ops.getCount('test', 'FILTER')).resolves.toEqual([
      'SELECT COUNT(*) AS count FROM test FILTER;',
      []
    ])
  );
  it('args param', () => 
    expect(ops.getCount('test', 0, ['args'])).resolves.toEqual([
      'SELECT COUNT(*) AS count FROM test ;',
      ['args']
    ])
  );
  it('uses sqlHelpers', async () => {
    await ops.getCount('test');
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });

  it('uses custom client', async () => {
    await ops.getCount('test',0,['args'],client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'SELECT COUNT(*) AS count FROM test ;',
      ['args'],
    );
  });
})

describe('getRows', () => {
  it('table param only', () => 
    expect(ops.getRows('test')).resolves.toEqual([
      'SELECT * FROM test ;',
      []
    ])
  );
  it('filter param', () => 
    expect(ops.getRows('test', 'FILTER')).resolves.toEqual([
      'SELECT * FROM test FILTER;',
      []
    ])
  );
  it('args param', () => 
    expect(ops.getRows('test', 0, ['args'])).resolves.toEqual([
      'SELECT * FROM test ;',
      ['args']
    ])
  );
  it('cols param', () => 
    expect(ops.getRows('test',0,0,'cols')).resolves.toEqual([
      'SELECT cols FROM test ;',
      []
    ])
  );
  it('all params', () => 
    expect(ops.getRows('test','FILTER',['args'],'cols')).resolves.toEqual([
      'SELECT cols FROM test FILTER;',
      ['args']
    ])
  );
  it('cols as string', () => 
    expect(ops.getRows('test',0,0,'colA, colB')).resolves.toEqual([
      'SELECT colA, colB FROM test ;',
      []
    ])
  );
  it('cols as array', () => 
    expect(ops.getRows('test',0,0,['colA','colB'])).resolves.toEqual([
      'SELECT colA, colB FROM test ;',
      []
    ])
  );

  it('adds limit and offset', () => 
    expect(ops.getRows('test',0,0,0,12,34)).resolves.toEqual([
      'SELECT * FROM test  LIMIT 12 OFFSET 34;',
      []
    ])
  );

  it('uses sqlHelpers', async () => {
    await ops.getRows('test');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getSolo).toHaveBeenCalledTimes(1);
    expect(soloInner).toHaveBeenCalledTimes(1);
  });

  it('uses custom client', async () => {
    await ops.getRows('test',0,'args',0,0,0,client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'SELECT * FROM test ;', 'args'
    );
  });
});


describe('getRow', () => {
  const getRowsSpy = jest.spyOn(ops, 'getRows');

  it('uses getRows', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledTimes(1);
  });
  it('table param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      'test',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });
  it('id param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      'WHERE id = $1',
      ['ID'],
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });
  it('no id param', async () => {
    await ops.getRow('test', null, 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      '',
      null,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });
  it('col param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'cols',
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });
  it('idCol param', async () => {
    await ops.getRow('test', 'ID', 'cols', {idCol: 'idCol', getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      'WHERE idCol = $1',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });
  it('getOne param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: true});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      'WHERE id = $1',
      expect.anything(),
      expect.anything(),
      1,
      expect.anything(),
      undefined,
    );
    expect(utils.getFirst).toHaveBeenCalledWith(true);
    
    getRowsSpy.mockClear()
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      'WHERE id = $1',
      expect.anything(),
      expect.anything(),
      0,
      expect.anything(),
      undefined,
    );
    expect(utils.getFirst).toHaveBeenCalledWith(false);
  });
  it('client param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false, client});
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      client,
    );
  });

  it('uses sqlHelpers', async () => {
    await ops.getRow('test','ID', null, {getOne: true});
    expect(utils.getFirst).toHaveBeenNthCalledWith(1,true);
    await ops.getRow('test','ID', null, {getOne: false});
    expect(utils.getFirst).toHaveBeenNthCalledWith(2,false);
    expect(utils.getFirst).toHaveBeenCalledTimes(2);
    expect(firstInner).toHaveBeenCalledTimes(2);
  });
});


// ----- DELETE ----- //

describe('rmvRows', () => {
  it('basic query', () => 
    expect(ops.rmvRows('test')).resolves.toEqual([
      'DELETE FROM test  RETURNING *;',
      []
    ])
  );

  it('passes args', () => 
    expect(ops.rmvRows('test', ['args'])).resolves.toEqual([
      expect.anything(),
      ['args'],
    ])
  );

  it('passes filter', () => 
    expect(ops.rmvRows('test', 0, 'FILTER')).resolves.toEqual([
      'DELETE FROM test FILTER RETURNING *;',
      expect.anything(),
    ])
  );

  it('uses sqlHelpers', async () => {
    await ops.rmvRows('test', ['args'], 'FILTER');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(0);
  });
  
  it('uses custom client', async () => {
    await ops.rmvRows('test', 0, 0, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM test  RETURNING *;',
      [],
    );
  });
});


describe('rmvRow', () => {
  const rmvRowsSpy = jest.spyOn(ops, 'rmvRows');

  it('uses rmvRows', async () => {
    await ops.rmvRow('test', 'ID');
    expect(rmvRowsSpy).toHaveBeenCalledTimes(1);
  });

  it('table param', async () => {
    await ops.rmvRow('test', 'ID');
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      'test',
      expect.anything(),
      expect.anything(),
      null,
    );
  });

  it('args param', async () => {
    await ops.rmvRow('test', 'ID');
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      ['ID'],
      expect.anything(),
      null,
    );
  });

  it('filter param', async () => {
    await ops.rmvRow('test', 'ID');
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'WHERE id = $1',
      null,
    );
  });

  it('client param', async () => {
    await ops.rmvRow('test', 'ID', client);
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      client,
    );
  });

  it('uses sqlHelpers', async () => {
    await ops.rmvRow('test', 'ID');
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
});


// ----- INSERT ----- //

describe('addRows', () => {

  it('correct query', async () => {
    await expect(ops.addRows('test', [{a: 11, b: 12},{a: 21, b: 22}])).resolves.toEqual([
      'INSERT INTO test (a,b) VALUES 0, 1 RETURNING *;',
      [11,12,21,22]
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(['a','b']);
  });

  it('adds empty row', () => {
    warnSpy.mockImplementationOnce(()=>{});
    return expect(ops.addRows('test',[])).resolves.toEqual([
      'INSERT INTO test DEFAULT VALUES  RETURNING *;',
      []
    ])
  });

  it('upsert changes query', () => {
    return expect(ops.addRows('test',[{a:1}],{ upsert: 1 })).resolves.toEqual([
      expect.stringMatching(/^UPSERT/),
      expect.any(Array)
    ])
  });
  
  it('uses custom client', async () => {
    await ops.addRows('test', [{a: 11}], { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'INSERT INTO test (a) VALUES 0 RETURNING *;',
      [11]
    );
  });

  it('error on missing objArray', () => 
    expect(() => ops.addRows('test'))
      .toThrow('Missing rows to add to test table.')
  );

  it('warns on empty objects', async () => {
    warnSpy.mockImplementationOnce(()=>{});
    await ops.addRows('test',[]);
    expect(warnSpy).toHaveBeenCalledWith('Added empty row to test');
  });

  it('uses sqlHelpers', async () => {
    await ops.addRows('test',[{a:1}]);
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getSolo).toHaveBeenCalledTimes(1);
    expect(soloInner).toHaveBeenCalledTimes(1);
  });
});

describe('addRow', () => {
  const addRowsSpy = jest.spyOn(ops, 'addRows');

  it('uses getRows', async () => {
    await ops.addRow('test', 'obj');
    expect(addRowsSpy).toHaveBeenCalledTimes(1);
  });
  it('table param', async () => {
    await ops.addRow('test', 'obj');
    expect(addRowsSpy).toHaveBeenCalledWith(
      'test',
      expect.anything(),
      expect.anything(),
    );
  });
  it('rowObj param', async () => {
    await ops.addRow('test', 'obj');
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      ['obj'],
      expect.anything(),
    );
  });
  it('no rowObj param', async () => {
    warnSpy.mockImplementationOnce(()=>{});
    await ops.addRow('test', null);
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      [],
      expect.anything(),
    );
  });
  it('options param', async () => {
    await ops.addRow('test', 'obj', { test: true });
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ test: true }),
    );
  });

  it('uses sqlHelpers', async () => {
    await ops.getRow('test','ID');
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(true);
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
});


// ----- UPDATE ----- //

describe('updateRow', () => {
  let origDirectMock;

  beforeAll(() => {
    origDirectMock = direct.query.getMockImplementation();
    direct.query.mockImplementation((...args) => Promise.resolve([args]));
  });

  afterAll(() => {
    direct.query.mockImplementation(origDirectMock);
  });

  it('correct query', async () => {
    await expect(ops.updateRow(
      'test',
      'ID',
      {a: 1, b: 2, c: 3},
    )).resolves.toEqual([{
      id: 'ID',
      0: 'UPDATE test SET a = $1, b = $2, c = $3 WHERE id = $4 RETURNING *;',
      1: [1, 2, 3, 'ID'],
      a: 1, b: 2, c: 3,
    }]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(['a','b','c']);
  });

  it('param idCol', async () => {
    const res = await ops.updateRow('test','ID',{a: 1},{idCol: 'IDCOL'});
    expect(res[0][0]).toEqual('UPDATE test SET a = $1 WHERE IDCOL = $2 RETURNING *;');
  });

  it('param looseMatch', async () => {
    const res = await ops.updateRow('test','ID',{a: 1},{looseMatch: true});
    expect(res[0][0]).toBe('UPDATE test SET a = $1 WHERE id ILIKE $2 RETURNING *;');
  });

  it('throws on empty updateObj', () => {
    expect.assertions(1);
    return expect(() => ops.updateRow('test','ID'))
      .toThrow('No properties provided to update test[ID]');
  });

  it('sends error on empty return', async () => {
    direct.query.mockResolvedValueOnce(null);
    return expect(ops.updateRow('test','ID',{a: 1})).resolves
      .toHaveProperty('0.error','Missing return value.');
  });
  
  it('uses sqlHelpers', async () => {
    await ops.updateRow('test','ID',{a: 1});
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(true);
    expect(firstInner).toHaveBeenCalledTimes(1);
  });

  it('param returnArray', async () => {
    await ops.updateRow('test','ID',{a: 1},{returnArray: true});
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(false);
  });

  it('uses custom client', async () => {
    await ops.updateRow('test','ID',{a: 1},{client});
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'UPDATE test SET a = $1 WHERE id = $2 RETURNING *;',
      [1, 'ID']
    );
  });
});