const MAX_AGE_RANGE = 10

export default function ageValidator(age?: string): string | null {
  if (!age) {
    return null
  }
  if (!isAgeOrRange(age.replace(/ /g, ''))) {
    if (age.indexOf('-') > 0) {
      return 'Invalid age range. Age ranges should be be no larger than 10 years.'
    }
    return 'Age must be a whole number'
  }

  return null
}

export function isAgeOrRange(field: string) {
  const regex = /^(?:[1-9][0-9]|1[0-9]{2}|[1-9][0-9]-([1-9][0-9]|1[0-9]{2}))$/

  if (!regex.test(field)) {
    return false
  }

  if (field.indexOf('-') === -1) {
    return true
  }

  const ageRange = field.split('-')

  if (ageRange[0] >= ageRange[1]) {
    return false
  }

  return Number(ageRange[1]) - Number(ageRange[0]) <= MAX_AGE_RANGE
}
