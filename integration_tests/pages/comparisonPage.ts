import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

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
    // TODO
    this.backLink = page.getByText('.govuk-back-link')
  }

  static async verifyOnPage(page: Page): Promise<ComparisonPage> {
    const comparisonPage = new ComparisonPage(page)
    await expect(comparisonPage.header).toBeVisible()
    return comparisonPage
  }
}
