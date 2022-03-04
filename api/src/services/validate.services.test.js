// Imports/Spies/Mocks
const services = require('./validate.services')
const schemaSpy = jest.spyOn(services, 'getSchema')
jest.mock('postgres-interval', () => 'parseInterval')

// Mock Config
jest.mock('../config/validation', () => ({
  types:  { setA: { a: 'type1', b: 'type2' }, setB: { c: 'type3', d: 'type4' }, },
  limits: { setA: { a: 'lims1', b: 'lims2' }, setB: { c: 'lims3' }, },
}))


// GET SCHEMA FROM CONFIG \\

describe('getSchemaFromCfg', () => {
  beforeEach(() => { schemaSpy.mockImplementation(()=>{}) })
  afterAll(() => { schemaSpy.mockRestore() })
  
  it('calls getSchema', () => {
    services.getSchemaFromCfg('setA', 'a', 'isIn', false)
    expect(schemaSpy).toBeCalledTimes(1)
  })
  it('passes key', () => {
    services.getSchemaFromCfg('setA', 'a', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      'a',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
  })
  it('passes isIn', () => {
    services.getSchemaFromCfg('setA', 'a', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'isIn',
      expect.anything(),
    )
  })
  it('passes falsy optional', () => {
    services.getSchemaFromCfg('setA', 'a', 'isIn', 0)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setA', 'a', 'isIn', '')
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
    )
  })
  
  it('gets type from config', () => {
    services.getSchemaFromCfg('setA', 'a', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      'type1',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setB', 'c', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      'type3',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
  })
  it('gets limits from config', () => {
    services.getSchemaFromCfg('setA', 'b', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      'lims2',
      expect.anything(),
      expect.anything(),
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setB', 'd', 'isIn', false)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      undefined,
      expect.anything(),
      expect.anything(),
    )
  })

  it('optional true if optional & isIn = [body]', () => {
    services.getSchemaFromCfg('setA', 'a', ['body'], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      true,
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setA', 'a', ['isIn','body'], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setA', 'a', [], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
    )
  })
  it('filters isIn if optional', () => {
    services.getSchemaFromCfg('setA', 'a', ['isIn','body'], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      ['isIn'],
      expect.anything(),
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setA', 'a', ['isInA','isInB'], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      ['isInA','isInB'],
      expect.anything(),
    )
    schemaSpy.mockClear()
    services.getSchemaFromCfg('setA', 'a', ['body'], true)
    expect(schemaSpy).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      ['body'],
      expect.anything(),
    )
  })
})


// GET SCHEMA \\

describe('getSchema', () => {

  describe('input vars', () => {
    it('key in return', () => {
      expect(services.getSchema('test','any',null,['isIn'],false))
        .toHaveProperty('test', expect.any(Object))
    })
    it('isIn in return', () => {
      expect(services.getSchema('test','any',null,['isIn'],false).test)
        .toHaveProperty('in', ['isIn'])
    })
    it('non-optional fields', () => {
      const result = services.getSchema('test','any',null,['isIn'],false)
      expect(result.test.exists).toHaveProperty('errorMessage')
      expect(result.test.notEmpty).toHaveProperty('errorMessage')
    })
    it('optional fields', () => {
      expect(services.getSchema('test','any',null,['isIn'],true).test)
        .toHaveProperty('optional', {options: {nullable: true}})
      expect(services.getSchema('test','any?',null,['isIn'],true).test)
        .toHaveProperty('optional', {options: {nullable: true}})
      expect(services.getSchema('test','any?',null,['isIn'],false).test)
        .toHaveProperty('optional', {options: {nullable: true}})
    })
    it('limits for string/float/int', () => {
      expect(services.getSchema('test','string','lims',['isIn'],false).test.isLength)
        .toEqual({ options: 'lims', errorMessage: expect.any(String) })
      expect(services.getSchema('test','float','lims',['isIn'],false).test.isFloat)
        .toEqual({ options: 'lims', errorMessage: expect.any(String) })
      expect(services.getSchema('test','int','lims',['isIn'],false).test.isInt)
        .toEqual({ options: 'lims', errorMessage: expect.any(String) })
    })
    it('just uses isType = { errorMsg } if missing limits', () => {
      expect(services.getSchema('test','float',null,['isIn'],false).test.isFloat)
        .toEqual({ errorMessage: expect.any(String) })
      expect(services.getSchema('test','int',null,['isIn'],false).test.isInt)
        .toEqual({ errorMessage: expect.any(String) })
    })
  })


  describe('types', () => {
    // Copy constants from validateServices
    const strictDates = true
    const dateOptions = { format: 'YYYY-MM-DD', strict: strictDates, delimiters: ['-'] }


    it('UUID', () => {
      const result = services.getSchema('test','uuid',null,['isIn'],false)
      expect(result.test).toHaveProperty('isUUID', {options: 4, errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('isAscii', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('stripLow', true)
      expect(result.test).toHaveProperty('trim', true)
      expect(result.test).toHaveProperty('escape', true)
    })
    it('string', () => {
      const result = services.getSchema('test','string',null,['isIn'],false)
      expect(result.test).toHaveProperty('isAscii', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('stripLow', true)
      expect(result.test).toHaveProperty('trim', true)
      expect(result.test).toHaveProperty('escape', true)
    })
    it('float', () => {
      const result = services.getSchema('test','float',null,['isIn'],false)
      expect(result.test).toHaveProperty('isFloat', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('toFloat', true)
    })
    it('int', () => {
      const result = services.getSchema('test','int',null,['isIn'],false)
      expect(result.test).toHaveProperty('isInt', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('toInt', true)
    })
    it('boolean', () => {
      const result = services.getSchema('test','boolean',null,['isIn'],false)
      expect(result.test).toHaveProperty('isBoolean', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('toBoolean', true)
    })
    it('interval', () => {
      const result = services.getSchema('test','interval',null,['isIn'],false)
      expect(result.test).toHaveProperty('custom', expect.any(Object))
      expect(result.test).toHaveProperty('customSanitizer', expect.any(Object))
      expect(result.test.custom).toEqual({options: expect.anything(), errorMessage: expect.any(String)})
      expect(result.test.customSanitizer).toEqual({options: expect.anything()})
    })
    it('datetime', () => {
      const result = services.getSchema('test','datetime',null,['isIn'],false)
      expect(result.test).toHaveProperty('isISO8601', {
        options: {strict: strictDates, strictSeparator: strictDates},
        errorMessage: expect.any(String)
      })
      expect(result.test).toHaveProperty('toDate', true)
    })
    it('date', () => {
      const result = services.getSchema('test','date',null,['isIn'],false)
      expect(result.test).toHaveProperty('isDate', {options: dateOptions, errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('trim', true)
    })
    it('object', () => {
      const result = services.getSchema('test','object',null,['isIn'],false)
      expect(result.test).toHaveProperty('isObject', {errorMessage: expect.any(String)})
    })
  })


  describe('interval', () => {
    it('validation', () => {
      const validate = services.getSchema('test','interval',null,['isIn'],false)
        .test.custom.options
      expect(validate).toEqual(expect.any(Function))
      expect(validate('01')).toBe(true)
      expect(validate('01:02')).toBe(true)
      expect(validate('01:02:03')).toBe(true)
      expect(validate('01:02:03:04')).toBe(false)
      expect(validate('01:0203')).toBe(false)
      expect(validate('1')).toBe(false)
      expect(validate('01:02:03a')).toBe(false)
      expect(validate('a01:02:03')).toBe(false)
    })
    it('sanitize w/ parseInterval', () => {
      const result = services.getSchema('test','interval',null,['isIn'],false)
      expect(result.test.customSanitizer.options).toBe('parseInterval')
    })
  })


  describe('array', () => {
    it('key & key.* in return', () => {
      const result = services.getSchema('test','any[]',null,['isIn'],false)
      expect(result).toHaveProperty('test', expect.any(Object))
      expect(result["test.*"]).toEqual(expect.any(Object))
    })
    it('array has basic props', () => {
      const result = services.getSchema('test','any[]',null,['isIn'],false)
      expect(result.test).toHaveProperty('isArray', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('in', ['isIn'])
    })
    it('elements basic props', () => {
      const result = services.getSchema('test','any[]',null,['isIn'],false)
      expect(result["test.*"]).not.toHaveProperty('isArray')
      expect(result["test.*"]).toHaveProperty('in', ['isIn'])
    })

    it('array has optional props', () => {
      let result = services.getSchema('test','any[]?',null,['isIn'],false)
      expect(result.test).toHaveProperty('optional', {options: {nullable: true}})
      expect(result.test).not.toHaveProperty('exists')
      expect(result.test).not.toHaveProperty('notEmpty')
      result = services.getSchema('test','any[]',null,['isIn'],true)
      expect(result.test).toHaveProperty('optional', {options: {nullable: true}})
      expect(result.test).not.toHaveProperty('exists')
      expect(result.test).not.toHaveProperty('notEmpty')
    })
    it('array has non-optional props', () => {
      const result = services.getSchema('test','any[]',null,['isIn'],false)
      expect(result.test).toHaveProperty('exists', {errorMessage: expect.any(String)})
      expect(result.test).toHaveProperty('notEmpty', {errorMessage: expect.any(String)})
      expect(result.test).not.toHaveProperty('optional')
    })
    it('elements missing optional props', () => {
      let result = services.getSchema('test','any[]?',null,['isIn'],false)
      expect(result["test.*"]).not.toHaveProperty('optional')
      expect(result["test.*"]).not.toHaveProperty('exists')
      expect(result["test.*"]).not.toHaveProperty('notEmpty')
      result = services.getSchema('test','any[]',null,['isIn'],true)
      expect(result["test.*"]).not.toHaveProperty('optional')
      expect(result["test.*"]).not.toHaveProperty('exists')
      expect(result["test.*"]).not.toHaveProperty('notEmpty')
      result = services.getSchema('test','any[]',null,['isIn'],false)
      expect(result["test.*"]).not.toHaveProperty('optional')
      expect(result["test.*"]).not.toHaveProperty('exists')
      expect(result["test.*"]).not.toHaveProperty('notEmpty')
    })
    
    it('type methods are under key.*', () => {
      const result = services.getSchema('test','float[]',null,['isIn'],false)
      expect(result.test).not.toHaveProperty('isFloat')
      expect(result.test).not.toHaveProperty('toFloat')
      expect(result["test.*"]).toHaveProperty('isFloat', {errorMessage: expect.any(String)})
      expect(result["test.*"]).toHaveProperty('toFloat', true)
    })

    it('limits are key.arrayLimits', () => {
      const result = services.getSchema('test','int[]','lims',['isIn'],false)
      expect(result.test).toHaveProperty('isArray', {options: 'lims', errorMessage: expect.any(String)})
      expect(result["test.*"]).toHaveProperty('isInt', {errorMessage: expect.any(String)})
    })
    it('limits.array for key & limits.elem for key.*', () => {
      const result = services.getSchema('test','int[]',{array:'aLims',elem:'eLims'},['isIn'],false)
      expect(result.test).toHaveProperty('isArray', {options: 'aLims', errorMessage: expect.any(String)})
      expect(result["test.*"]).toHaveProperty('isInt', {options: 'eLims', errorMessage: expect.any(String)})
    })
    it('limits.array only', () => {
      const result = services.getSchema('test','int[]',{array:'aLims'},['isIn'],false)
      expect(result.test).toHaveProperty('isArray', {options: 'aLims', errorMessage: expect.any(String)})
      expect(result["test.*"]).toHaveProperty('isInt', {errorMessage: expect.any(String)})
    })
    it('limits.elem only', () => {
      let result = services.getSchema('test','int[]',{elem:'eLims'},['isIn'],false)
      expect(result.test).toHaveProperty('isArray', {errorMessage: expect.any(String)})
      expect(result["test.*"]).toHaveProperty('isInt', {options: 'eLims', errorMessage: expect.any(String)})
      result = services.getSchema('test','int',{elem:'eLims'},['isIn'],false)
      expect(result.test).toHaveProperty('isInt', {options: 'eLims', errorMessage: expect.any(String)})
    })
  })


  describe('errors', () => {
    it('errorMessage on key', () => {
      expect(services.getSchema('test','any',null,['isIn'],false).test)
        .toHaveProperty('errorMessage', 'does not exist as any')
    })
    it('errorMessage on key.*', () => {
      expect(services.getSchema('test','any[]',null,['isIn'],false)['test.*'])
        .toHaveProperty('errorMessage', 'does not exist as any')
    })
    it('throws on missing/invalid typeStr', () => {
      expect(() => services.getSchema('test',undefined,null,['isIn'],false))
        .toThrowError('test has missing type definition: ')  
      expect(() => services.getSchema('test','?wrong',null,['isIn'],false))
        .toThrowError('test has invalid type definition: ?wrong')
    })
    it('throws on missing/empty isIn', () => {
      expect(() => services.getSchema('test','any',null,undefined,false))
        .toThrowError('test missing \'in\' array for validation')
      expect(() => services.getSchema('test','any',null,[],false))
        .toThrowError('test missing \'in\' array for validation')
    })
  })
})