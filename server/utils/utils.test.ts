import { convertToTitleCase, initialiseName, filterSearch, filterCategories } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string | null, a: string | null, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string | null, a: string | null, expected: string | null) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('filterSearch', () => {
  it.each([
    ['add filter', ['male'], 'female', '&filters=male&filters=female'],
    ['remove filter', ['male', 'female'], 'female', '&filters=male'],
    ['no filters', [], 'male', '&filters=male'],
  ])('%s filterSearch(%s, %s, %s)', (_: string, currentFilters: string[], searchFilter: string, expected: string) => {
    expect(filterSearch(currentFilters, searchFilter)).toEqual(expected)
  })
})

describe('filterCategories', () => {
  it('returns correct categories', () => {
    const searchFilters = ['male', 'lifer']
    const result = filterCategories(searchFilters)
    expect(result.categories[0].items).toEqual([
      { href: '/search/results?page=1&filters=lifer', text: 'Male', selected: true },
      { href: '/search/results?page=1&filters=male&filters=lifer&filters=female', text: 'Female', selected: false },
      { href: '/search/results?page=1&filters=male', text: 'Lifer', selected: true },
      { href: '/search/results?page=1&filters=male&filters=lifer&filters=hdc', text: 'HDC', selected: false },
    ])
  })
})
