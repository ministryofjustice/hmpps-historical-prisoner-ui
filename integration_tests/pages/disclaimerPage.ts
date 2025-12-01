import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SearchPage from './searchPage'

export default class DisclaimerPage extends AbstractPage {
  readonly header: Locator

  readonly disclaimerCheckbox: Locator

  readonly confirmButton: Locator

  readonly errorMessage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Usage' })
    this.disclaimerCheckbox = page.getByRole('checkbox', { name: 'I confirm that I understand' })
    this.confirmButton = page.getByTestId('continue-button')
    this.errorMessage = page.getByRole('link', { name: 'You must confirm that you' })
  }

  static async verifyOnPage(page: Page): Promise<DisclaimerPage> {
    const disclaimerPage = new DisclaimerPage(page)
    await expect(disclaimerPage.header).toBeVisible()
    return disclaimerPage
  }

  static async confirmDisclaimer(page: Page): Promise<SearchPage> {
    const disclaimerPage = await this.verifyOnPage(page)
    await disclaimerPage.disclaimerCheckbox.click()
    await disclaimerPage.confirmButton.click()
    return SearchPage.verifyOnPage(page)
  }
}
