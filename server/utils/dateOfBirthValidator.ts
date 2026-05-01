import { isAfter, isValid, parse, startOfToday } from 'date-fns'

export default function dateOfBirthValidator(day?: string, month?: string, year?: string): string | null {
  if (!day && !month && !year) {
    return null
  }

  if (!(isOneOrTwoDigits(day) && isOneOrTwoDigits(month) && isFourDigits(year))) {
    return 'Enter a valid date of birth in the format DD/MM/YYYY'
  }

  const today = startOfToday()
  const dobDate = parse(`${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`, 'yyyy-MM-dd', today)
  if (!isValid(dobDate)) {
    return 'Enter a valid date of birth in the format DD/MM/YYYY'
  }
  if (dobDate.getFullYear() < 1900) {
    return 'Year must be greater than or equal to 1900'
  }
  if (isAfter(dobDate, today)) {
    return 'The date of birth cannot be in the future'
  }
  return null
}

const isOneOrTwoDigits = (value?: string): boolean => {
  return !Number.isNaN(Number(value)) && (value?.length === 1 || value?.length === 2)
}

const isFourDigits = (value?: string): boolean => {
  return !Number.isNaN(Number(value)) && value?.length === 4
}
