import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstract'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import SearchPage from './search'
import DisclaimerPage from './disclaimer'

export default class ComparisonPage extends AbstractPage {
  readonly header: Locator

  readonly detail1Link: Locator

  readonly removeFromShortlist1: Locator

  readonly backLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Prisoner comparison' })
    this.detail1Link = page.getByTestId('name1')
    this.removeFromShortlist1 = page.getByTestId('remove-link1')
    this.backLink = page.getByRole('link', { name: 'Go back to search results' })
  }

  static async verifyOnPage(page: Page): Promise<ComparisonPage> {
    const comparisonPage = new ComparisonPage(page)
    await expect(comparisonPage.header).toBeVisible()
    return comparisonPage
  }

  static async navigateToShortlist(page: Page): Promise<ComparisonPage> {
    const searchPage: SearchPage = await DisclaimerPage.confirmDisclaimer(page)

    // need to carry out a search to get the results into the session
    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()

    // add 3 items to shortlist
    await searchPage.shortlistFormSubmit('BF123455')
    await searchPage.shortlistFormSubmit('BF123456')
    await searchPage.shortlistFormSubmit('BF123457')

    await searchPage.viewShortlistLink.click()

    return ComparisonPage.verifyOnPage(page)
  }

  removeFromShortlist(index: number) {
    return this.page.getByTestId(`remove-link${index}`)
  }

  detailLink(index: number) {
    return this.page.getByTestId(`name${index}`)
  }
}
