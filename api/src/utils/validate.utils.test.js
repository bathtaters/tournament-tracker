const { getTypeArray, customInterval, escapedLength } = require('./validate.utils')
const { escape } = require('validator').default

// Check getTypeArray (test*[]? => [test*[]?, test, *, [], ?])
describe('getTypeArray', () => {
  it('nothing', () => {
    expect(getTypeArray()).toBeFalsy()
    expect(getTypeArray('')).toBeFalsy()
  })
  it('[0] = input', () => {
    expect(getTypeArray('test')[0]).toBe('test')
    expect(getTypeArray('test*[]?')[0]).toBe('test*[]?')
  })
  it('[1] = typeStr', () => {
    expect(getTypeArray('test')[1]).toBe('test')
    expect(getTypeArray('test*[]?')[1]).toBe('test')
  })
  it('[2] = leaveWhiteSpace', () => {
    expect(getTypeArray('test')[2]).toBeFalsy()
    expect(getTypeArray('test*')[2]).toBe('*')
    expect(getTypeArray('test[]?')[2]).toBeFalsy()
    expect(getTypeArray('test*[]?')[2]).toBe('*')
  })
  it('[3] = isArray', () => {
    expect(getTypeArray('test')[3]).toBeFalsy()
    expect(getTypeArray('test[]')[3]).toBe('[]')
    expect(getTypeArray('test*?')[3]).toBeFalsy()
    expect(getTypeArray('test*[]?')[3]).toBe('[]')
  })
  it('[4] = isOptional', () => {
    expect(getTypeArray('test')[4]).toBeFalsy()
    expect(getTypeArray('test?')[4]).toBe('?')
    expect(getTypeArray('test*[]')[4]).toBeFalsy()
    expect(getTypeArray('test*[]?')[4]).toBe('?')
  })
})


// Interval validator [[hh:]mm:]ss
describe('custom interval validator', () => {
  it('accepts valid intervals', () => {
    expect(customInterval.validate('01')).toBe(true)
    expect(customInterval.validate('01:02')).toBe(true)
    expect(customInterval.validate('01:02:03')).toBe(true)
  })
  it('rejects invalid intervals', () => {
    expect(customInterval.validate('01:02:03:04')).toBe(false)
    expect(customInterval.validate('01:0203')).toBe(false)
    expect(customInterval.validate('1')).toBe(false)
    expect(customInterval.validate('01:02:03a')).toBe(false)
    expect(customInterval.validate('a01:02:03')).toBe(false)
  })
})


// Check escapedLength accurately counts length of escaped string
//   ex: '&' =esc=> '&amp;' ('amp' has max length of 5)
describe('escapedLength', () => {
  const validator = escapedLength({ options: { min: 1, max: 8 } }).options

  it('passes errorMessage', () => {
    expect(escapedLength({errorMessage: 'test'})).toHaveProperty('errorMessage', 'test')
  })
  it('true on no options', () => {
    expect(escapedLength({options: {}}).options('test')).toBe(true)
    expect(escapedLength({           }).options('test')).toBe(true)
    expect(escapedLength({options: {}}).options(1     )).toBe(true)
    expect(escapedLength({           }).options(1     )).toBe(true)
    expect(escapedLength({options: {}}).options(      )).toBe(true)
    expect(escapedLength({           }).options(      )).toBe(true)
  })
  it('false on non-string', () => {
    expect(validator()).toBe(false)
    expect(validator(1)).toBe(false)
    expect(validator([])).toBe(false)
    expect(validator({})).toBe(false)
  })
  it('works w/ standard string', () => {
    expect(validator('')).toBe(false)
    expect(validator('t')).toBe(true)
    expect(validator('test')).toBe(true)
    expect(validator('test str')).toBe(true)
    expect(validator('long test')).toBe(false)
    expect(validator('very long test')).toBe(false)
  })
  it('works w/ unescaped string', () => {
    expect(validator('&')).toBe(true)
    expect(validator('&<>"')).toBe(true)
    expect(validator('"<&! />"')).toBe(true)
    expect(validator('"<&! />"\'')).toBe(false)
    expect(validator('"<test! & />"')).toBe(false)
  })
  it('works w/ escaped string', () => {
    expect(validator(escape('&'))).toBe(true)
    expect(validator(escape('&<>"'))).toBe(true)
    expect(validator(escape('"<&! />"'))).toBe(true)
    expect(validator(escape('"<&! />"\''))).toBe(false)
    expect(validator(escape('"<test! & />"'))).toBe(false)
  })
  it('works w/ edge cases', () => {
    expect(validator('&#amps;&#amps;')).toBe(true)
    expect(validator('test &#amps;st')).toBe(true)
    expect(validator('t&st st&#amps;')).toBe(true)
    expect(validator('test &; &')).toBe(true)
    expect(validator('test &; &1')).toBe(false)
    expect(validator('&toolong;')).toBe(false)
    expect(validator('&too long')).toBe(false)
  })
})
