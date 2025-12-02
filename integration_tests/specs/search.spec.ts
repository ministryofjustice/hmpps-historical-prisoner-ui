import { expect, test } from '@playwright/test'

import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import DisclaimerPage from '../pages/disclaimerPage'
import SearchPage from '../pages/searchPage'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'

test.describe('Search', () => {
  test.beforeEach('Navigate to search page', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will show the search form with name/age selected', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)
    await expect(searchPage.nameAgeRadioButton).toBeChecked()
  })

  test('Will display name search data entered when the search is performed', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)
    await searchPage.firstName.fill('John')
    await searchPage.lastName.fill('Smith')
    await searchPage.dobDay.fill('25')
    await searchPage.dobMonth.fill('11')
    await searchPage.dobYear.fill('1986')

    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()

    await expect(searchPage.firstName).toHaveValue('John')
    await expect(searchPage.lastName).toHaveValue('Smith')
    await expect(searchPage.dobDay).toHaveValue('25')
    await expect(searchPage.dobMonth).toHaveValue('11')
    await expect(searchPage.dobYear).toHaveValue('1986')
  })

  test('Will allow certain non-alphabetic characters in first and last name', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)

    await searchPage.firstName.fill("John-James's%*")
    await searchPage.lastName.fill("Smith-JonesO'Malley%*")

    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()

    await expect(searchPage.firstName).toHaveValue("John-James's%*")
    await expect(searchPage.lastName).toHaveValue("Smith-JonesO'Malley%*")

    await expect(searchPage.errorSummary).toBeHidden()
  })

  test('Will display identifier search data entered when the search is performed', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)

    await searchPage.identifierRadioButton.click()
    await searchPage.prisonNumber.fill('A1234BC')
    await searchPage.pncNumber.fill('012345/99A')
    await searchPage.croNumber.fill('012345/CR0')

    await historicalPrisonerApi.stubPrisonerSearchByIdentifiers()
    await searchPage.searchButton.click()

    await expect(searchPage.identifierRadioButton).toBeChecked()
    await expect(searchPage.prisonNumber).toHaveValue('A1234BC')
    await expect(searchPage.pncNumber).toHaveValue('012345/99A')
    await expect(searchPage.croNumber).toHaveValue('012345/CR0')
  })

  test('Will display address search data entered when the search is performed', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)

    await searchPage.otherRadioButton.click()
    await searchPage.address.fill('Hill Valley')

    await historicalPrisonerApi.stubPrisonerSearchByAddress()
    await searchPage.searchButton.click()

    await expect(searchPage.otherRadioButton).toBeChecked()
    await expect(searchPage.address).toHaveValue('Hill Valley')
  })

  test('Will clear the search form when New Search is selected', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)

    await searchPage.firstName.fill('John')
    await searchPage.lastName.fill('Smith')

    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()

    await expect(searchPage.firstName).toHaveValue('John')
    await expect(searchPage.lastName).toHaveValue('Smith')

    await searchPage.newSearch.click()

    await expect(searchPage.firstName).toHaveValue('')
    await expect(searchPage.lastName).toHaveValue('')
  })

  test.describe('Will show/hide the suggestion link', () => {
    test('Will show the suggestion link if searching by first name', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.firstName.fill('John')
      await historicalPrisonerApi.stubPrisonerSearchByName()
      await searchPage.doSearch()

      await expect(searchPage.suggestions).toBeVisible()
    })
    test('Will show the suggestion link if searching by last name', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.lastName.fill('Smith')
      await historicalPrisonerApi.stubPrisonerSearchByName()
      await searchPage.doSearch()

      await expect(searchPage.suggestions).toBeVisible()
    })
    test('Will show the suggestion link if searching by date of birth', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobDay.fill('25')
      await searchPage.dobMonth.fill('12')
      await searchPage.dobYear.fill('2000')
      await historicalPrisonerApi.stubPrisonerSearchByName()
      await searchPage.doSearch()

      await expect(searchPage.suggestions).toBeVisible()
    })
    test('Will not show the suggestion link if searching by name with age range', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('19-25')

      await historicalPrisonerApi.stubPrisonerSearchByName()
      await searchPage.doSearch()
      await expect(searchPage.suggestions).not.toBeVisible()
    })
    test('Will not show the suggestion link if searching by id', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.identifierRadioButton.click()
      await searchPage.prisonNumber.fill('A1234BC')

      await historicalPrisonerApi.stubPrisonerSearchByIdentifiers()
      await searchPage.doSearch()
      await expect(searchPage.suggestions).not.toBeVisible()
    })
    test('Will not show the suggestion link if searching by address', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.otherRadioButton.click()
      await searchPage.address.fill('Hill')

      await historicalPrisonerApi.stubPrisonerSearchByAddress()
      await searchPage.doSearch()
      await expect(searchPage.suggestions).not.toBeVisible()
    })
  })

  test.describe('FormValidation', () => {
    test('Will show an error if attempt to submit the name/age form without any data', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Please enter a value for at least one Name/age field')
    })

    test('Will show an error if attempt to submit the identifier form without any data', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.identifierRadioButton.click()
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Please enter a value for at least one Identifier field')
    })

    test('Will show an error if attempt to submit the address form without any data', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.otherRadioButton.click()
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Please enter a value for the address field')
    })

    test('Will show an error if attempt to submit the first name form with invalid characters', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.firstName.fill('dfg4')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText(
        'First Name must not contain space, numbers or special characters',
      )
    })

    test('Will show an error if attempt to submit the last name form with invalid characters', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.lastName.fill('dfg4')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText(
        'Last name must not contain space, numbers or special characters',
      )
    })

    test('Will show an error if attempt to submit the dob with missing day', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobMonth.fill('12')
      await searchPage.dobYear.fill('1984')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter a valid date of birth in the format DD/MM/YYYY')
    })

    test('Will show an error if attempt to submit the dob with missing month', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobDay.fill('25')
      await searchPage.dobYear.fill('1984')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter a valid date of birth in the format DD/MM/YYYY')
    })

    test('Will show an error if attempt to submit the dob with missing year', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobDay.fill('25')
      await searchPage.dobDay.fill('12')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter a valid date of birth in the format DD/MM/YYYY')
    })
    test('Will show an error if attempt to submit the dob with invalid characters', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobDay.fill('et')
      await searchPage.dobDay.fill('12')
      await searchPage.dobYear.fill('1984')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter a valid date of birth in the format DD/MM/YYYY')
    })

    test('Will show an error if attempt to submit the dob with an invalid date', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.dobDay.fill('31')
      await searchPage.dobDay.fill('11')
      await searchPage.dobYear.fill('1984')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter a valid date of birth in the format DD/MM/YYYY')
    })

    test('Will show an error if attempt to submit the age/range with an age too small', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('9')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Age must be a whole number')
    })
    test('Will show an error if attempt to submit the age/range with an age too big', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('200')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Age must be a whole number')
    })
    test('Will show an error if attempt to submit the age/range with a non-numerical age', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('wr')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Age must be a whole number')
    })
    test('Will show an error if attempt to submit the age/range with a negative age range', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('19-15')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText(
        'Invalid age range. Age ranges should be be no larger than 10 years.',
      )
    })
    test('Will show an error if attempt to submit the age/range with an age range more than 10 years', async ({
      page,
    }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('19-39')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText(
        'Invalid age range. Age ranges should be be no larger than 10 years.',
      )
    })
    test('Will show an error if attempt to submit the age/range with non-numerical age range', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.age.fill('er-3245')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText(
        'Invalid age range. Age ranges should be be no larger than 10 years.',
      )
    })

    test('Will show an error if attempt to submit an address with only one word', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)

      await searchPage.otherRadioButton.click()
      await searchPage.address.fill('Hill')
      await searchPage.doSearch()
      await expect(searchPage.errorSummary).toBeVisible()
      await expect(searchPage.errorSummary).toHaveText('Enter at least 2 address elements')
    })
  })
})
