// Imports/Mocks
const base = require('./advancedAccess');
const connect = require('./connect');
const fs = require('fs/promises');
jest.mock('fs/promises');
jest.mock('./connect');

// Tests
describe('operation', () => {
  
  it('passes falsy value', async () => {
    connect.runOperation.mockResolvedValueOnce(false);
    expect(base.operation()).resolves.toBe(false);
  });

  it('returns truthy value', async () => {
    connect.runOperation.mockResolvedValueOnce('test');
    expect(base.operation()).resolves.toBe('test');
  });

  it('passes standard array', async () => {
    connect.runOperation.mockResolvedValueOnce(['test','rows']);
    expect(base.operation()).resolves.toEqual(['test','rows']);
  });

  it('gets rows from pg object array', async () => {
    connect.runOperation.mockResolvedValueOnce([{rows:['test','rows','a']},{rows:['test','rows','b']}]);
    expect(base.operation()).resolves.toEqual([['test','rows','a'],['test','rows','b']]);
  });

  it('gets rows from single pg object', async () => {
    connect.runOperation.mockResolvedValueOnce({rows:['test','rows']});
    expect(base.operation()).resolves.toEqual(['test','rows']);
  });

});

describe('query', () => {
  let mockRun, mockClient;

  beforeAll(() => {
    mockClient = {
      query: jest.fn((...args) => Promise.resolve({ rows: args })).mockName('client.query'),
      release: jest.fn().mockName('client.release'),
    };
    mockRun = connect.runOperation.mockImplementation(async op => op(mockClient));
  });

  it('passes attempts/retries to runOp', async () => {
    const res = await base.query(['1;'], [], false, 43, 21);
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun).toBeCalledWith(expect.any(Function), 43, 21);
  })

  it('accepts array input', async () => {
    const res = await base.query(['1','2','3']);

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;',[]],
      ['2;',[]],
      ['3;',[]]
    ]);
  });

  it('accepts semicolon delimited input', async () => {
    const res = await base.query('1;2;3;');

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;',[]],
      ['2;',[]],
      ['3;',[]]
    ]);
  });

  // Back compat
  it('accepts repeating args', async () => {
    const res = await base.query(
      ['1;', '2;', '3;'],
      ['A', 'R']
    );

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;', ['A','R']],
      ['2;', ['A','R']],
      ['3;', ['A','R']]
    ]);
  });

  // Back compat
  it('accepts split args', async () => {
    const res = await base.query(
      ['1;', '2;', '3;'],
      [['A'], ['B'], ['C']]
    );

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;', ['A']],
      ['2;', ['B']],
      ['3;', ['C']]
    ]);
  });

  it('accepts forcing repeat args', async () => {
    const res = await base.query(
      ['1;', '2;', '3;'],
      ['A', 'R'],
      false
    );

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;', ['A','R']],
      ['2;', ['A','R']],
      ['3;', ['A','R']]
    ]);
  });

  it('accepts forcing split args', async () => {
    const res = await base.query(
      ['1;', '2;', '3;'],
      [['A'], ['B'], ['C']],
      true
    );

    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual([
      ['1;', ['A']],
      ['2;', ['B']],
      ['3;', ['C']]
    ]);
  });

  it('passes single query', async () => {
    const res = await base.query('QRY');

    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.release).not.toHaveBeenCalled();
    expect(res).toEqual(['QRY;',[]]); // back compat (unnestIfSolo)
    // expect(res).toEqual([['QRY;',[]]]);
  });

});



describe('loadFiles', () => {

  it('fails on file error', async () => {
    fs.readFile.mockImplementation(() => { throw new Error('Test Error'); });
    await expect(base.loadFiles(['File'])).rejects.toThrowError('Test Error');
  });

  it('combines files into array', async () => {
    const mockReadFile = fs.readFile
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('2')
      .mockResolvedValueOnce('3');

    const res = await base.loadFiles(['A','B','C'])
    
    expect(mockReadFile).toHaveBeenCalledTimes(3);
    expect(res).toEqual(['1','2','3']);
  });

  it('flattens array, removes comments/white space', async () => {
    const mockReadFile = fs.readFile.mockResolvedValue(`
    -- Comment
     Standard command;   
    
      Multi-
    line command;  
    
    `);
    const output = ['Standard command','Multi- line command'];

    const res = await base.loadFiles(['File1','File2'])

    expect(mockReadFile).toHaveBeenCalledTimes(2);
    expect(res).toEqual(output.concat(output));
  });

});

