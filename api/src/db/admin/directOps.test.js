// Imports/Mocks
const base = require('./directOps');
const connect = require('./connect');
const fs = require('fs/promises');
jest.mock('fs/promises');
jest.mock('./connect');

// Tests

describe('query', () => {
  let mockRun, mockClient;

  beforeAll(() => {
    mockClient = {
      query: jest.fn((...args) => Promise.resolve(args)).mockName('client.query'),
      release: jest.fn().mockName('client.release'),
    };
    mockRun = connect.runOperation.mockImplementation(async op => op(mockClient));
  });

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
    expect(res).toEqual([['QRY;',[]]]);
  });

});



describe('loadFiles', () => {

  it('fails on file error', async () => {
    expect.assertions(1);
    fs.readFile.mockImplementation(() => { throw new Error('Test Error'); });
    await expect(base.loadFiles(['File'])).rejects.toThrow('Test Error');
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


