const properCase = (word: string): string =>
  word.length >= 1 ? word[0]!.toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str?: string | null): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence?: string | null): string =>
  isBlank(sentence) ? '' : sentence!.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string | null): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0]?.[0]}. ${array.reverse()[0]}`
}

export const filterSearch = (currentFilters: string[], searchFilter: string): string => {
  const searchParams = new URLSearchParams()
  let filters = Array.from(currentFilters)

  if (filters.includes(searchFilter)) {
    // remove it
    filters = filters.filter(item => item !== searchFilter)
  } else {
    filters.push(searchFilter)
  }
  filters.forEach(entry => {
    searchParams.append('filters', entry)
  })
  return searchParams.size > 0 ? `&${searchParams.toString()}` : ''
}

export const filterCategories = (searchFilters: string[]) => {
  const hrefBase = '/search/results?page=1'
  const filters = searchFilters === undefined ? [] : Array.from(searchFilters)

  const categories = [
    {
      items: [
        {
          href: `${hrefBase}${filterSearch(filters, 'male')}`,
          text: 'Male',
          selected: filters.includes('male'),
        },
        {
          href: `${hrefBase}${filterSearch(filters, 'female')}`,
          text: 'Female',
          selected: filters.includes('female'),
        },
        {
          href: `${hrefBase}${filterSearch(filters, 'lifer')}`,
          text: 'Lifer',
          selected: filters.includes('lifer'),
        },
        {
          href: `${hrefBase}${filterSearch(filters, 'hdc')}`,
          text: 'HDC',
          selected: filters.includes('hdc'),
        },
      ],
    },
  ]

  return {
    categories: categories.filter(category => category.items),
  }
}

export const arrayToQueryString = (array: string[] | number[] | boolean[], key: string): string =>
  array && array.map(item => `${key}=${encodeURIComponent(item)}`).join('&')
