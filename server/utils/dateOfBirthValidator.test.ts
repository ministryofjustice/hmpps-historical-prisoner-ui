import validateTargetDate from './dateOfBirthValidator'

describe('dateOfBirthValidator', () => {
  Array.of(
    { day: undefined, month: '4', year: '24' },
    { day: '26', month: undefined, year: '24' },
    { day: '26', month: '4', year: undefined },
    { day: '26', month: '4', year: '24' },
    { day: '26', month: '40', year: '2024' },
    { day: '', month: '02', year: '2040' },
    { day: '26', month: '', year: '2040' },
    { day: '26', month: '02', year: '' },
    { day: '][', month: '8', year: '2025' },
    { day: '2nd', month: '8', year: '2025' },
    { day: '2', month: 'AUG', year: '2025' },
    { day: 'X', month: 'X11', year: 'MMXXV' },
  ).forEach(dateValues => {
    it(`should validate given an invalid date - day: ${dateValues.day}, month: ${dateValues.month}, year: ${dateValues.year}`, () => {
      const errors = validateTargetDate(dateValues.day, dateValues.month, dateValues.year)

      expect(errors).toStrictEqual('Enter a valid date of birth in the format DD/MM/YYYY')
    })
  })

  it('should ignore empty strings for all fields', () => {
    Array.of({ day: undefined, month: undefined, year: undefined }, { day: '', month: '', year: '' }).forEach(
      dateValues => {
        const errors = validateTargetDate(dateValues.day, dateValues.month, dateValues.year)

        expect(errors).toStrictEqual(null)
      },
    )
  })

  it('should not allow dates before 1900', () => {
    const day = '31'
    const month = '12'
    const year = '1899'
    const errors = validateTargetDate(day, month, year)

    expect(errors).toStrictEqual('Year must be greater than or equal to 1900')
  })

  it('should validate given a date in the future', () => {
    const day = '26'
    const month = '02'
    const year = '3007'
    const errors = validateTargetDate(day, month, year)

    expect(errors).toStrictEqual('The date of birth cannot be in the future')
  })

  it('should successfully validate', () => {
    Array.of(
      { day: '01', month: '01', year: '1900' },
      { day: '11', month: '11', year: '2024' },
      { day: '12', month: '12', year: '2023' },
    ).forEach(dateValues => {
      const errors = validateTargetDate(dateValues.day, dateValues.month, dateValues.year)

      expect(errors).toBeNull()
    })
  })
})
