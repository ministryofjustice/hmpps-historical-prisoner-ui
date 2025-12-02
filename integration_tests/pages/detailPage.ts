import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class DetailPage extends AbstractPage {
  readonly header: Locator

  readonly printLink: Locator

  readonly backToTopLink: Locator

  readonly backLink: Locator

  readonly backToShortlistLink: Locator

  readonly footer: Locator

  private constructor(name: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: name })
    this.printLink = page.getByRole('link', { name: 'Save as PDF' })
    this.backLink = page.getByRole('link', { name: 'Go back to search results' })
    this.backToShortlistLink = page.getByRole('link', { name: 'Go back to shortlist' })
    this.backToTopLink = page.getByRole('link', { name: 'Back to top' })
    this.footer = page.getByRole('heading', { name: 'Get help with DPS' })
  }

  static async verifyOnPage(name: string, page: Page): Promise<DetailPage> {
    const detailPage = new DetailPage(name, page)
    await expect(detailPage.header).toBeVisible()
    return detailPage
  }
}
