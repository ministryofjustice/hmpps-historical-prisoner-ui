import { PrisonerSearchForm } from 'express-session'
import HmppsError from '../../interfaces/HmppsError'
import dateOfBirthValidator from '../../utils/dateOfBirthValidator'
import ageValidator from '../../utils/ageValidator'

export function isAlphabeticOrWildcard(field: string | undefined): boolean {
  return field === undefined || /^[A-Za-z-'%*]*$/.test(field)
}

function validateNameData(form: PrisonerSearchForm, errors: HmppsError[]) {
  if (!form.firstName && !form.lastName && !form.dobYear && !form.dobMonth && !form.dobDay && !form.age) {
    errors.push({
      href: '',
      text: 'Please enter a value for at least one Name/age field',
    })
  }
  if (!isAlphabeticOrWildcard(form.firstName)) {
    errors.push({ href: '#firstName', text: 'First Name must not contain space, numbers or special characters' })
    return
  }

  if (!isAlphabeticOrWildcard(form.lastName)) {
    errors.push({ href: '#lastName', text: 'Last name must not contain space, numbers or special characters' })
    return
  }
  const dobError = dateOfBirthValidator(form.dobDay, form.dobMonth, form.dobYear)
  if (dobError) {
    errors.push({ href: '#dateOfBirth', text: dobError })
    return
  }

  const ageError = ageValidator(form.age)
  if (ageError != null) {
    errors.push({ href: '#age', text: ageError })
  }
}

function validateIdentifierData(form: PrisonerSearchForm, errors: HmppsError[]) {
  if (!form.prisonNumber && !form.pncNumber && !form.croNumber) {
    errors.push({
      href: '',
      text: 'Please enter a value for at least one Identifier field',
    })
  }
}

function validateAddressData(form: PrisonerSearchForm, errors: HmppsError[]) {
  if (!form.address) {
    errors.push({ href: '', text: 'Please enter a value for the address field' })
  } else if (form.address.split(' ').length < 2) {
    errors.push({ href: '#address', text: 'Enter at least 2 address elements' })
  }
}

export default function validate(form: PrisonerSearchForm): HmppsError[] {
  const errors: HmppsError[] = []

  switch (form.searchType) {
    case 'name':
      validateNameData(form, errors)
      break
    case 'identifier':
      validateIdentifierData(form, errors)
      break
    case 'address':
      validateAddressData(form, errors)
      break
    default:
      errors.push({ href: '#searchType', text: 'Enter a valid search type' })
  }
  return errors
}
