import logger from '../../logger'

export function formatDate(date?: string | null): string {
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat(['en-GB']).format(new Date(date))
  } catch (e) {
    logger.warn(`Invalid date found ${date}`, e)
    return date
  }
}

export function getAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const diffMs = Date.now() - dob.getTime()
  const ageDt = new Date(diffMs)

  return Math.abs(ageDt.getUTCFullYear() - 1970)
}
