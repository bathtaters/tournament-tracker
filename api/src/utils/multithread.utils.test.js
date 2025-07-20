// Imports/Mocks
const { Worker } = require('worker_threads');
const logger = require('../utils/log.adapter');
const { spawnAsync, abort, isActive, isAborted } = require('./multithread.utils');

// Mock worker_threads
jest.mock('worker_threads', () => {
  class Worker {
    static _instances = []
    static setMaxListeners = jest.fn()

    constructor(...args) {
      this._args = args
      this._events = {}
      this._terminated = false

      this.on = jest.fn().mockImplementation((event, callback) => {
        this._events[event] = callback
        return this
      })
      
      this.emit = jest.fn().mockImplementation(
        (event, arg) => this._events[event](arg)
      )

      this.postMessage = jest.fn()

      this.terminate = jest.fn().mockImplementation(async () => {
        if (!this._terminated) {
          this._terminated = true
          this.emit('exit', 1)
        }
        return 0
      })

      Worker._instances.push(this)
    }
  }
  return { Worker }
});

// Mock logger
jest.mock('../utils/log.adapter', () => ({
  log: jest.fn(),
  error: jest.fn()
}));

// Reset Tests
beforeEach(() => {
  jest.clearAllMocks();
  Worker._instances = []
});
afterEach(async () => {
  if (isActive('test-id')) await abort('test-id')
})

// Tests
describe('spawnAsync', () => {
  it('throws error if process is already active', () => {
    expect.assertions(1)
    spawnAsync('test-id', 'test-path', { data: 'test' });
    
    // Second call should throw
    expect(() => spawnAsync('test-id', 'test-path', { data: 'test' }))
      .toThrow('Process already active: test-id');
  });

  it('creates a worker and posts message', () => {
    const data = { foo: 'bar' };
    spawnAsync('test-id', 'test-path', data);
    
    expect(Worker._instances[0]._args).toEqual(['test-path']);
    expect(Worker._instances[0].postMessage).toHaveBeenCalledWith(data);
  });

  it('sets up event handlers', () => {
    spawnAsync('test-id', 'test-path', {});
    
    expect(Worker._instances[0].on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(Worker._instances[0].on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(Worker._instances[0].on).toHaveBeenCalledWith('messageerror', expect.any(Function));
    expect(Worker._instances[0].on).toHaveBeenCalledWith('exit', expect.any(Function));
  });

  it('logs messages from worker', () => {
    spawnAsync('test-id', 'test-path', {});
    Worker._instances[0].emit('message', 'Worker message'); // Simulate worker message
    
    expect(logger.log).toHaveBeenCalledWith('Message from thread test-id:', 'Worker message');
  });

  it('logs errors from worker', () => {
    spawnAsync('test-id', 'test-path', {});
    const error = new Error('Worker error');
    Worker._instances[0].emit('error', error); // Simulate worker error
    
    expect(logger.error).toHaveBeenCalledWith('Error from thread test-id:', error);
  });

  it('terminates on exit with code', () => {
    spawnAsync('test-id', 'test-path', {});    
    Worker._instances[0].emit('exit', 1); // Simulates error exit

    expect(logger.error).toHaveBeenCalledWith('Thread test-id ended with exit code: 1');
    expect(Worker._instances[0].terminate).toHaveBeenCalled();
  });

  it('terminates on normal exit', () => {
    spawnAsync('test-id', 'test-path', {});
    Worker._instances[0].emit('exit', 0); // Simulate normal exit

    expect(logger.error).not.toHaveBeenCalled();
    expect(Worker._instances[0].terminate).toHaveBeenCalled();
  });
});

describe('abort', () => {
  it('aborts an active process', async () => {
    expect.assertions(2)
    spawnAsync('test-id', 'test-path', { value: 1 });

    await expect(abort('test-id')).resolves.toBe(0);
    expect(Worker._instances[0].terminate).toHaveBeenCalled();
  });

  it('throws error if process not found', async () => {
    expect.assertions(1)
    await expect(abort('non-existent-id')).rejects.toThrow('Process not found: non-existent-id');
  });
});

describe('isActive', () => {
  it('returns true for active process', () => {
    spawnAsync('test-id', 'test-path', { value: 1 });
    expect(isActive('test-id')).toBe(true);
  });

  it('returns false for inactive process', () => {
    expect(isActive('non-existent-id')).toBe(false);
  });
});

describe('isAborted', () => {
  it('returns true for aborted process', async () => {
    spawnAsync('test-id', 'test-path', { value: 1 });
    await abort('test-id');
    expect(isAborted('test-id')).toBe(true);
  });

  it('returns false for non-aborted process', () => {
    expect(isAborted('non-existent-id')).toBe(false);
  });
});