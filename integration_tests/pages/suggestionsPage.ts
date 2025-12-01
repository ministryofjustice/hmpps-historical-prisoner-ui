import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class SuggestionsPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly newSearch: Locator

  readonly useInitial: Locator

  readonly forenameWildcard: Locator

  readonly surnameWildcard: Locator

  readonly surnameShorterWildcard: Locator

  readonly swap: Locator

  readonly dob: Locator

  readonly age: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Suggestions and tips' })
    this.backLink = page.getByRole('link', { name: 'Go back to search results' })
    this.newSearch = page.getByTestId('clear-search')
    this.useInitial = page.getByTestId('use-initial')
    this.forenameWildcard = page.getByTestId('forename-wildcard')
    this.surnameWildcard = page.getByTestId('surname-wildcard')
    this.surnameShorterWildcard = page.getByTestId('surname-shorterwildcard')
    this.swap = page.getByTestId('swap')
    this.dob = page.getByTestId('dob')
    this.age = page.getByTestId('age')
  }

  static async verifyOnPage(page: Page): Promise<SuggestionsPage> {
    const suggestionsPage = new SuggestionsPage(page)
    await expect(suggestionsPage.header).toBeVisible()
    return suggestionsPage
  }
}
