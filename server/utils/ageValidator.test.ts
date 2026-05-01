import ageValidator from './ageValidator'

describe('ageValidator', () => {
  it('should return null for undefined', () => {
    expect(ageValidator(undefined)).toBeNull()
  })

  it('should return null for an empty string', () => {
    expect(ageValidator('')).toBeNull()
  })

  it('should return null for a valid single age', () => {
    expect(ageValidator('25')).toBeNull()
  })

  it('should return null for a valid age range within the limit', () => {
    expect(ageValidator('25-30')).toBeNull()
  })

  it('should return error message if aged 9', () => {
    expect(ageValidator('9')).toBe('Age must be a whole number')
  })

  it('should return error message if aged 200', () => {
    expect(ageValidator('200')).toBe('Age must be a whole number')
  })

  it('should return error message if age upper limit 200', () => {
    expect(ageValidator('199-200')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })

  it('should return error message for an age range exceeding the limit', () => {
    expect(ageValidator('25-40')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })

  it('should return error message for an invalid age range with the start age greater than the end age', () => {
    expect(ageValidator('30-25')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })

  it('should return error message for a non-numeric age', () => {
    expect(ageValidator('abc')).toBe('Age must be a whole number')
  })

  it('should return error message for a non-numeric age range', () => {
    expect(ageValidator('abc-def')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })

  it('should return error message for an age range with non-numeric start age', () => {
    expect(ageValidator('abc-25')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })

  it('should return error message for an age range with non-numeric end age', () => {
    expect(ageValidator('25-abc')).toBe('Invalid age range. Age ranges should be be no larger than 10 years.')
  })
})
