// Spies & Imports
const checkValidation = require('../middleware/validate.middleware')
const services = require('../services/validate.services')
const schemaSpy  =   jest.spyOn(services,   'getSchema')
const schemaCfgSpy = jest.spyOn(services,   'getSchemaFromCfg')

const shared = require('./shared.validators')

// Mocks
jest.mock('express-validator', () => ({ checkSchema: jest.fn((r)=>[r]) }))
jest.mock('../middleware/validate.middleware', () => 'checkValidation')
jest.mock('../config/validation', () => ({
  types:  { setA: { a: 'type1', b: 'type2' }, setB: { c: 'type3', d: 'type4' }, },
  limits: { setA: { a: 'lims1', b: 'lims2' }, setB: { c: 'lims3' }, },
}))


// -- USING KEY tests -- //

describe('usingKey', () => {
  beforeAll(() => schemaSpy.mockImplementation(()=>{}))
  afterAll(() => schemaSpy.mockRestore())
  
  it('calls getSchema', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledTimes(1)
  })
  it('passes key', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      'a',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
  })
  it('passes isIn', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      ['in'],
      expect.anything(),
    )
  })
  it('passes optional', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'opt',
    )
  })
  it('gets type', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      expect.anything(),
      'type2',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
  })
  it('gets limits', () => {
    shared.usingKey('a','setA','b', { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'lims2',
      expect.anything(),
      expect.anything(),
    )
  })

  it('uses mainKey if no useKey provided', () => {
    shared.usingKey('a','setA',null, { isIn: 'in', optional: 'opt' })
    expect(schemaSpy).toHaveBeenCalledWith(
      expect.anything(),
      'type1',
      'lims1',
      expect.anything(),
      expect.anything(),
    )
  })
})



// -- BY SET tests -- //

describe('bySet', () => {
  beforeAll(() => schemaCfgSpy.mockImplementation((_,key)=>({ [key]: true })))
  afterAll(() => schemaCfgSpy.mockRestore())

  it('calls getSchemaFromCfg forEach key', () => {
    shared.bySet('setA')(['a'],['a','b'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenCalledTimes(2)
  })

  it('passes set to getSchemaFromCfg', () => {
    shared.bySet('setA')(['a'],['a','b'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1, 
      'setA',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2, 
      'setA',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
  })
  it('passes optionalBody to getSchemaFromCfg', () => {
    shared.bySet('setA')(['a'],['a','b'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1, 
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'opt',
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2, 
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'opt',
    )
  })

  it('passes each key to getSchemaFromCfg', () => {
    shared.bySet('setA')(['a'],['a','b'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1, 
      expect.anything(),
      'a',
      expect.anything(),
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2, 
      expect.anything(),
      'b',
      expect.anything(),
      expect.anything(),
    )
  })
  it('builds isIn array for getSchemaFromCfg', () => {
    shared.bySet('setA')(['a'],['a','b'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1, 
      expect.anything(),
      expect.anything(),
      ['params','body'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2, 
      expect.anything(),
      expect.anything(),
      ['body'],
      expect.anything(),
    )
  })

  it('ignores falsy keys', () => {
    shared.bySet('setA')(['a'],0,'opt',false)
    expect(schemaCfgSpy).toHaveBeenCalledWith(
      expect.anything(),
      'a',
      ['params'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenCalledTimes(1)
  })
  it('"all" as key list uses all keys under cfg.types', () => {
    shared.bySet('setB')('all',['d'],'opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1,
      expect.anything(),
      'c',
      ['params'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2,
      expect.anything(),
      'd',
      ['params','body'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenCalledTimes(2)
  })
  it('converts key string to array', () => {
    shared.bySet('setB')(['c'],'d','opt',false)
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(1,
      expect.anything(),
      'c',
      ['params'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenNthCalledWith(2,
      expect.anything(),
      'd',
      ['body'],
      expect.anything(),
    )
    expect(schemaCfgSpy).toHaveBeenCalledTimes(2)
  })
  
  it('builds object of results', () => {
    expect(shared.bySet('setA')(['a'],['a','b'],'opt',false))
      .toEqual([{ a: true, b: true }])
  })
  it('check appends validation checker', () => {
    expect(shared.bySet('setA')(['a'],['a','b'],'opt',true))
      .toEqual([
        expect.anything(),
        checkValidation
      ])
  })
})
