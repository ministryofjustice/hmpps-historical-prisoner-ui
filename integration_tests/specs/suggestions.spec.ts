import { expect, test } from '@playwright/test'
import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import SearchPage from '../pages/searchPage'
import DisclaimerPage from '../pages/disclaimerPage'
import SuggestionsPage from '../pages/suggestionsPage'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'

test.describe('Suggestions', () => {
  test.beforeEach(async () => {
    await frontendComponents.stubFrontendComponents()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Back link will take user back to search results page with search pre-populated', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.backLink.click()
    const backToSearchPage = await SearchPage.verifyOnPage(page)
    await expect(backToSearchPage.firstName).toHaveValue('John')
  })

  test('New search link will take user back to search page with search cleared', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.newSearch.click()
    const backToSearchPage = await SearchPage.verifyOnPage(page)
    await expect(backToSearchPage.firstName).toHaveValue('')
  })

  test('Will suggest using initial for forename', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    suggestionsPage.useInitial.locator('span', { hasText: 'J' })
    await suggestionsPage.useInitial.locator('a').click()

    await expect(searchPage.firstName).toHaveValue('J')
  })

  test('Will suggest adding wildcard to forename', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.firstName.fill('Alex')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)

    suggestionsPage.forenameWildcard.locator('span', { hasText: 'Alex*' })
    await suggestionsPage.forenameWildcard.locator('a').click()

    await expect(searchPage.firstName).toHaveValue('Alex*')
  })

  test('Will suggest adding wildcard to surname', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.lastName.fill('Smith')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.surnameWildcard.locator('span', { hasText: 'Smith*' })
    await suggestionsPage.surnameWildcard.locator('a').click()

    await expect(searchPage.lastName).toHaveValue('Smith*')
  })

  test('Will suggest adding shorter wildcard to surname', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.lastName.fill('Smith')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.surnameShorterWildcard.locator('span', { hasText: 'Smi*' })
    await suggestionsPage.surnameShorterWildcard.locator('a').click()

    await expect(searchPage.lastName).toHaveValue('Smi*')
  })

  test('Will suggest adding swapping forename and surname', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.firstName.fill('John')
    await searchPage.lastName.fill('Smith')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.swap.locator('span', { hasText: 'Smith John' })
    await suggestionsPage.swap.locator('a').click()

    await expect(searchPage.lastName).toHaveValue('John')
    await expect(searchPage.firstName).toHaveValue('Smith')
  })

  test('Will suggest adding swapping forename and surname when one is empty', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.lastName.fill('Smith')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.swap.locator('span', { hasText: 'Smith ' })
    await suggestionsPage.swap.locator('a').click()

    await expect(searchPage.lastName).toHaveValue('')
    await expect(searchPage.firstName).toHaveValue('Smith')
  })

  test('Will suggest adding changing dob to age range', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.dobYear.fill(`${new Date().getFullYear() - 15}`)
    await searchPage.dobMonth.fill('10')
    await searchPage.dobDay.fill('12')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.dob.locator('span', { hasText: '13-17' })
    await suggestionsPage.dob.locator('a').click()

    await expect(searchPage.dobYear).toHaveValue('')
    await expect(searchPage.dobMonth).toHaveValue('')
    await expect(searchPage.dobDay).toHaveValue('')
    await expect(searchPage.age).toHaveValue('13-17')
  })

  test('Will suggest adding changing age to age range', async ({ page }) => {
    await login(page)
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    await searchPage.age.fill('15')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await searchPage.suggestions.click()

    const suggestionsPage = await SuggestionsPage.verifyOnPage(page)
    await suggestionsPage.age.locator('span', { hasText: '13-17' })
    await suggestionsPage.age.locator('a').click()

    await expect(searchPage.dobYear).toHaveValue('')
    await expect(searchPage.dobMonth).toHaveValue('')
    await expect(searchPage.dobDay).toHaveValue('')
    await expect(searchPage.age).toHaveValue('13-17')
  })
})
