// Mock Config
const mockServerCfg = {
  connectionString: "TestConnString",
  users: [ { name: "test", pass: "testpw" } ],
  server: { serverVars: "server" },
};

// Imports/Mocks
const getConnStr = require('./getConnStr');
const utils = require('./utils');
jest.mock('../config/dbServer.json', () => mockServerCfg, {virtual: true});
jest.mock('./utils', () => ({ replaceFromObj: jest.fn(o=>o) }));


// Test
describe('getConnStr', () => {

  it('gets connStr', () => {
    expect(getConnStr('test', mockServerCfg))
      .toBe(mockServerCfg.connectionString);
  });

  it('gets connStr w/o user', () => {
    const result = getConnStr(null, {connectionString: 'TestConnString'});
    expect(result).toBe('TestConnString');
    expect(utils.replaceFromObj).toHaveBeenCalledTimes(2);
  });
  
  describe('error handling', () => {

    it('fails on missing config', () => {
      expect(() => getConnStr(null, {})).toThrow('Server config is invalid');
    });

    it('fails on user not found', () => {
      expect(() => getConnStr('MissingUser')).toThrow('No credentials for MissingUser');
    });
  });

  describe('external calls', () => {

    it('calls replFromObj() using serverData', () => {
      getConnStr('test', mockServerCfg);

      expect(utils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(utils.replaceFromObj).toHaveBeenNthCalledWith(1,
        mockServerCfg.connectionString,
        mockServerCfg.server,
        {pre:'%',caseI:1},
      );
    });
    
    it('calls replFromObj() using userData', () => {
      getConnStr('test', mockServerCfg);

      expect(utils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(utils.replaceFromObj).toHaveBeenNthCalledWith(2,
        mockServerCfg.connectionString,
        mockServerCfg.users[0],
        {pre:'%',caseI:1,esc:1},
      );
    });

    it('calls replFromObj() using envData', () => {
      getConnStr('test', mockServerCfg);

      expect(utils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(utils.replaceFromObj).toHaveBeenNthCalledWith(3,
        mockServerCfg.connectionString,
        expect.objectContaining({ HOME: process.env.HOME || "" }),
        {pre:'\\$'},
      );
    });
  });
});