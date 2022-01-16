// Imports/Mocks
const mockWarn = jest.spyOn(global.console, "warn");
const connect = require('./connect');
const utils = require('../../services/sqlUtils');
jest.mock('../../services/sqlUtils');


// Mock retryBlock (Forces retry, then resolves)
const forceRetry = async (callback,args,m,n,c,retryCb) => {
  await retryCb('ERR', ...args);
  return callback(...args);
};

// console.warn settings
afterAll(() => { mockWarn.mockRestore(); });


describe('runOperation', () => {
  // Init Mocks
  const retryBlockErr = 'Attempted rollback & released client due to error.';
  let mockClient, mockPool, mockOp;

  beforeAll(() => {
    utils.retryBlock.mockImplementation((cb,a) => cb(...a));
    mockClient = {
      query: jest.fn(msg => Promise.resolve(msg)).mockName('client.query'),
      release: jest.fn(() => Promise.resolve()).mockName('client.release'),
    };
    mockPool = {
      connect: jest.fn(() => Promise.resolve(mockClient)).mockName('pool.connect'),
    };
    mockOp = jest.fn(client => client.query('Op success')).mockName('operation');
  })

  it('successful with mocks', async () => {
    await expect(connect.runOperation(mockOp, 43, 21, mockPool)).resolves
      .toBe('Op success');
  });

  describe('error handling', () => {
    beforeEach(() => { mockWarn.mockImplementationOnce(()=>{}); });

    it('fails on no pool', async () => {
      console.warn('Clear mockWarn');
      await expect(connect.runOperation(mockOp))
        .rejects.toThrowError("Attempting DB access before successfully opening connection.");
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('fails on no client', async () => {
      console.warn('Clear mockWarn');
      mockPool.connect.mockResolvedValueOnce(null);
      await expect(connect.runOperation(mockOp, 43, 21, mockPool))
        .rejects.toThrowError("Unable to connect to DB.");
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('rollback on operation retry', async () => {
      // Force retry on 2nd call (1st call is to get client)
      utils.retryBlock.mockImplementationOnce((cb,a) => cb(...a))
        .mockImplementationOnce(forceRetry);
      
      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).resolves
        .toBe('Op success');
      
      expect(mockClient.query).toHaveBeenNthCalledWith(2,"ROLLBACK;BEGIN;");
      expect(mockWarn).toBeCalledWith('Rolling back & retrying due to: ERR');
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('rollback on retryBlock error', async () => {
      // Throws error on 2nd call (while calling operation)
      utils.retryBlock.mockImplementationOnce((cb,a) => cb(...a))
        .mockImplementationOnce(() => { throw new Error('Test Error'); });

      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).rejects.toThrow();

      expect(mockClient.query).toHaveBeenNthCalledWith(2,"ROLLBACK;");
      expect(mockWarn).toBeCalledWith(retryBlockErr);
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('bubbles up retryBlock error', async () => {
      // Throws error on 2nd call (while calling operation)
      utils.retryBlock.mockImplementationOnce((cb,a) => cb(...a))
        .mockImplementationOnce(() => { throw new Error('Test Error'); });

      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).rejects
        .toThrowError('Test Error');
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('rollback on operation error', async () => {
      mockOp.mockImplementationOnce(() => { throw new Error('Test Error'); });

      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).rejects.toThrow();
      expect(mockClient.query).toHaveBeenNthCalledWith(2,"ROLLBACK;");
      expect(mockWarn).toBeCalledWith(retryBlockErr);
      expect(mockWarn).toBeCalledTimes(1);
    });

    it('bubbles up operation error', async () => {
      mockOp.mockImplementationOnce(() => { throw new Error('Test Error'); });

      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).rejects
        .toThrowError('Test Error');
        expect(mockWarn).toBeCalledWith(retryBlockErr);
        expect(mockWarn).toBeCalledTimes(1);
    });
  });

  describe('setup & breakdown', () => {

    it('passes pool arg to retryBlock', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(utils.retryBlock).toHaveBeenNthCalledWith(1, 
        expect.any(Function), // pool => pool.connect()
        [mockPool],
        expect.any(Number) // 5 (maxRetries)
      );
    });

    it('runs pool.connect() once', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockPool.connect).toHaveBeenCalledWith();
    });

    it('makes BEGIN & COMMIT calls', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(mockClient.query).toHaveBeenNthCalledWith(1,'BEGIN;');
      expect(mockClient.query).toHaveBeenLastCalledWith('COMMIT;');
    });

    it('releases client on success', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('releases client on failure', async () => {
      mockWarn.mockImplementationOnce(()=>{}); // Ignore warning
      mockOp.mockImplementationOnce(() => { throw new Error('Test Error'); });

      await expect(connect.runOperation(mockOp, 43, 21, mockPool)).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockWarn).toBeCalledTimes(1);
    });
  });

  describe('executing query', () => {
    it('passes attempts/retries/code to retryBlock', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(utils.retryBlock).toHaveBeenNthCalledWith(2, 
        expect.any(Function), // (op,client) => op(client)
        expect.anything(), // argsArray (tested next)
        43, // maxRetries
        21, // retryCount
        ["40001"], // retryCodes (= ["40001"])
        expect.any(Function), // retryCallback
      );
    });

    it('passes client/operation args to retryBlock', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(utils.retryBlock).toHaveBeenNthCalledWith(2, 
        expect.any(Function), // (op,client) => op(client)
        [mockClient, mockOp], // argsArray (= [client,op])
        expect.any(Number), // maxRetries (tested prior)
        expect.any(Number), // retryCount (tested prior)
        expect.anything(), // retryCodes (tested prior)
        expect.any(Function), // retryCallback
      );
    });

    it('passes operation(client) call to retryBlock', async () => {
      await connect.runOperation(mockOp, 43, 21, mockPool);

      expect(mockOp).toHaveBeenCalledTimes(1);
      expect(mockOp).toHaveBeenCalledWith(mockClient);
    });
  });
});

