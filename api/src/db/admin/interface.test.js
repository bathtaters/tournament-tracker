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

  it('uses sqlHelpers', async () => {
    await ops.getRows('test');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getSolo).toHaveBeenCalledTimes(1);
    expect(soloInner).toHaveBeenCalledTimes(1);
  });

  it('uses custom client', async () => {
    await ops.getRows('test',0,'args',0,client);
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
    expect(getRowsSpy).toBeCalledTimes(1);
  });
  it('table param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toBeCalledWith(
      'test',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      null,
    );
  });
  it('id param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      'WHERE id = $1',
      ['ID'],
      expect.anything(),
      null,
    );
  });
  it('no id param', async () => {
    await ops.getRow('test', null, 'cols', {getOne: false});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      '',
      null,
      expect.anything(),
      null,
    );
  });
  it('col param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'cols',
      null,
    );
  });
  it('idCol param', async () => {
    await ops.getRow('test', 'ID', 'cols', {idCol: 'idCol', getOne: false});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      'WHERE idCol = $1',
      expect.anything(),
      expect.anything(),
      null,
    );
  });
  it('getOne param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: true});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      'WHERE id = $1 LIMIT 1',
      expect.anything(),
      expect.anything(),
      null,
    );
    expect(utils.getFirst).toHaveBeenCalledWith('ID');
  });
  it('client param', async () => {
    await ops.getRow('test', 'ID', 'cols', {getOne: false, client});
    expect(getRowsSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      client,
    );
  });

  it('uses sqlHelpers', async () => {
    await ops.getRow('test','ID', null, {getOne: true});
    expect(utils.getFirst).toHaveBeenNthCalledWith(1,'ID');
    await ops.getRow('test','ID', null, {getOne: false});
    expect(utils.getFirst).toHaveBeenNthCalledWith(2,false);
    expect(utils.getFirst).toHaveBeenCalledTimes(2);
    expect(firstInner).toHaveBeenCalledTimes(2);
  });
});


// ----- DELETE ----- //

describe('rmvRow', () => {
  it('correct query', () => 
    expect(ops.rmvRow('test', 'ID')).resolves.toEqual([
      'DELETE FROM test WHERE id = $1 RETURNING id;',
      ['ID']
    ])
  );

  it('uses sqlHelpers', async () => {
    await ops.rmvRow('test','ID');
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
  
  it('uses custom client', async () => {
    await ops.rmvRow('test', 'ID', client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM test WHERE id = $1 RETURNING id;',
      ['ID']
    );
  });
});


// ----- INSERT ----- //

describe('addRows', () => {

  it('correct query', async () => {
    await expect(ops.addRows('test', [{a: 11, b: 12},{a: 21, b: 22}])).resolves.toEqual([
      'INSERT INTO test (a,b) VALUES 0, 1 RETURNING id;',
      [11,12,21,22]
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(['a','b']);
  });

  it('adds empty row', () => {
    warnSpy.mockImplementationOnce(()=>{});
    return expect(ops.addRows('test',[])).resolves.toEqual([
      'INSERT INTO test DEFAULT VALUES  RETURNING id;',
      []
    ])
  });

  it('upsert changes query', () => {
    return expect(ops.addRows('test',[{a:1}],{ upsert: 1 })).resolves.toEqual([
      expect.stringMatching(/^UPSERT/),
      expect.any(Array)
    ])
  });

  it('disable returning clause', () => {
    return expect(ops.addRows('test',[{a:1}],{ returning: 0 })).resolves.toEqual([
      expect.not.stringContaining('RETURNING'),
      expect.any(Array)
    ])
  });
  
  it('uses custom client', async () => {
    await ops.addRows('test', [{a: 11}], { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'INSERT INTO test (a) VALUES 0 RETURNING id;',
      [11]
    );
  });

  it('error on missing objArray', () => 
    expect(() => ops.addRows('test'))
      .toThrowError('Missing rows to add to test table.')
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
    expect(addRowsSpy).toBeCalledTimes(1);
  });
  it('table param', async () => {
    await ops.addRow('test', 'obj');
    expect(addRowsSpy).toBeCalledWith(
      'test',
      expect.anything(),
      expect.anything(),
    );
  });
  it('rowObj param', async () => {
    await ops.addRow('test', 'obj');
    expect(addRowsSpy).toBeCalledWith(
      expect.anything(),
      ['obj'],
      expect.anything(),
    );
  });
  it('no rowObj param', async () => {
    warnSpy.mockImplementationOnce(()=>{});
    await ops.addRow('test', null);
    expect(addRowsSpy).toBeCalledWith(
      expect.anything(),
      [],
      expect.anything(),
    );
  });
  it('options param', async () => {
    await ops.addRow('test', 'obj', { test: true });
    expect(addRowsSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ test: true }),
    );
  });

  it('uses sqlHelpers', async () => {
    await ops.getRow('test','ID');
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith('ID');
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
});


// ----- UPDATE ----- //

describe('updateRow', () => {
  it('correct query', async () => {
    await expect(ops.updateRow(
      'test',
      'ID',
      {a: 1, b: 2, c: 3},
      { returning: 'x' }
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
    return expect(() => ops.updateRow('test','ID'))
      .toThrowError('No properties provided to update test[ID]');
  });

  it('sends error on empty return', () => {
    direct.query.mockResolvedValueOnce(null);
    return expect(ops.updateRow('test','ID',{a: 1})).resolves
      .toHaveProperty('error','Missing return value.');
  });
  
  it('uses sqlHelpers', async () => {
    await ops.updateRow('test','ID',{a: 1});
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });

  it('uses custom client', async () => {
    await ops.updateRow('test', 'ID', {a: 1}, { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'UPDATE test SET a = $2 WHERE id = $1 RETURNING id;',
      ['ID', 1]
    );
  });
});