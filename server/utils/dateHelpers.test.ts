import { formatDate, getAge } from './dateHelpers'

describe('formatDate', () => {
  it.each([
    ['Empty string', '', ''],
    ['Null string', null, ''],
    ['Valid date string', '2023-10-15', '15/10/2023'],
    ['Valid date string with time', '2023-10-15T14:48:00.000Z', '15/10/2023'],
    ['Invalid date string', 'invalid-date', 'invalid-date'],
    ['Date with different format', '15-10-2023', '15-10-2023'],
    ['Date with slashes', '15/10/2023', '15/10/2023'],
  ])('%s formatDate(%s, %s)', (_: string, date: string | null, expected: string) => {
    expect(formatDate(date)).toEqual(expected)
  })
})

describe('getAge', () => {
  const mockCurrentDate = new Date('2023-10-15')
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockCurrentDate)
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  it.each([
    ['2000-01-01', 23], // current date set to 2023-10-15
    ['1990-05-15', 33],
    ['1985-10-25', 37],
    ['2020-12-31', 2],
  ])('should return correct age for date of birth %s', (dateOfBirth, expectedAge) => {
    expect(getAge(dateOfBirth)).toBe(expectedAge)
  })

  it('should handle invalid date strings gracefully', () => {
    expect(getAge('invalid-date')).toBeNaN()
  })

  it('should handle empty date strings gracefully', () => {
    expect(getAge('')).toBeNaN()
  })
})
