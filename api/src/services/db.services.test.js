const db = require('./db.services')

// Mocks/Spies
const testSpy = jest.spyOn(db, 'testDatabase')
const { execFiles } = require('../db/admin/directOps')
jest.mock('../db/admin/directOps')
const runOperation = jest.fn()


describe('testDb', () => {
  it('returns truthy if tables exist', () => {
    expect.assertions(1)
    runOperation.mockResolvedValueOnce({ rows: [1] })
    expect(db.testDatabase(runOperation)).resolves.toBeTruthy()
  })
  it('returns falsy if no tables exist', () => {
    expect.assertions(2)
    runOperation.mockResolvedValueOnce(null)
    expect(db.testDatabase(runOperation)).resolves.toBeFalsy()
    runOperation.mockResolvedValueOnce({ rows: [] })
    expect(db.testDatabase(runOperation)).resolves.toBeFalsy()
  })
  it('bubbles up error', () => {
    expect.assertions(1)
    runOperation.mockRejectedValueOnce(new Error('TEST'))
    expect(() => db.testDatabase(runOperation)).rejects.toThrowError('TEST')
  })
})

describe('resetDb', () => {
  const exec = {
    reset: /resetDb.sql$/,
    test:  /dbtest.sql$/,
  }

  it('calls reset on fullReset > returns &2', async () => {
    expect.assertions(3)
    testSpy.mockResolvedValueOnce(true)
    expect(await db.resetDatabase(true, false, runOperation)).toBe(2)
    expect(execFiles).toBeCalledTimes(1)
    expect(execFiles).toBeCalledWith([expect.stringMatching(exec.reset)])
  })
  it('calls test on testReset > returns &1', async () => {
    expect.assertions(3)
    expect(await db.resetDatabase(false, true, runOperation)).toBe(1)
    expect(execFiles).toBeCalledTimes(1)
    expect(execFiles).toBeCalledWith([expect.stringMatching(exec.test)])
  })
  it('calls both > returns 3', async () => {
    expect.assertions(4)
    testSpy.mockResolvedValueOnce(true)
    expect(await db.resetDatabase(true, true, runOperation)).toBe(3)
    expect(execFiles).toBeCalledTimes(2)
    expect(execFiles).toHaveBeenNthCalledWith(1, 
      [expect.stringMatching(exec.reset)]
    )
    expect(execFiles).toHaveBeenNthCalledWith(2, 
      [expect.stringMatching(exec.test)]
    )
  })
  it('calls none > returns 0', async () => {
    expect.assertions(2)
    expect(await db.resetDatabase(false, false, runOperation)).toBe(0)
    expect(execFiles).toBeCalledTimes(0)
  })
  it('runs test after fullReset', async () => {
    expect.assertions(2)
    testSpy.mockResolvedValueOnce(true)
    await db.resetDatabase(false, true, runOperation)
    expect(testSpy).toBeCalledTimes(0)
    await db.resetDatabase(true, false, runOperation)
    expect(testSpy).toBeCalledTimes(1)
  })
  it('throws error on failed test', () => {
    expect.assertions(1)
    testSpy.mockResolvedValueOnce(false)
    expect(() => db.resetDatabase(true, false, runOperation)).rejects
      .toThrowError('ResetDB did not work!')
  })
})